import Parser from 'tree-sitter';
import * as fs from 'fs';
// 或者
// const Parser = require('tree-sitter');

// 假设你的 .node 文件在你的 tree-sitter-modelica 包的 build/Release/ 目录下
// 并且你已经将 tree-sitter-modelica 安装为你的 TypeScript 项目的依赖
// import Modelica from 'tree-sitter-modelica';
const Modelica = require('/mnt/tree-sitter-modelica/build/Release/tree_sitter_modelica_binding.node');

// import Modelica = require('tree-sitter-modelica');

// import Modelica from '../tree-sitter-modelica/build/Release/tree_sitter_modelica_binding.node';

const parser = new Parser();
// console.log("modelica parser:", Modelica);

parser.setLanguage(Modelica);

let sourceCode = 'model SimpleEx Real a, b, c, d, e; equation sqrt ( a ) = 65 " Equation f1"; d = a /( b* e ) " Equation f2"; e = d ^3 " Equation f3"; b = sqrt ( e ) " Equation f4"; 0 = a ^2 + c " Equation f5"; end SimpleEx ; ';

let complexCode = '\
model SimpleEx \
Real a, b, c, d, e; \
equation \
body.cylinder.rxvisobj[2] = body.frame_a.R.T[1,2] * body.cylinder.n_z_aux[3] + body.frame_a.R.T[2,2]*body.cylinder.e_x[2] + sin(tr.y[1,1]); \
A[1,1] = body.I[3,3]+body.r_CM[1]*body.m*body.r_CM[1]+body.r_CM[2]*body.m*body.r_CM[2]; \
body.cylinder.e_aux1[1] = if body.cylinder.n_z_aux[1]*body.cylinder.n_z_aux[1]+body.cylinder.n_z_aux[3]*body.cylinder.n_z_aux[3]>0.000001 then 0 else if abs(body.cylinder.n_z_aux[3])>0.000001 then 0 else 1; \
world.x_arrowLine.shapeType = "cylinder"; \
world.x_label.cylinders[1].abs_n_x = sqrt(world.x_label.cylinders[1].lengthDirection[1].a[3,4,5].b[4,5,6].c[6,7].d[6]*world.x_label.cylinders[1].lengthDirection[1]+world.x_label.cylinders[1].lengthDirection[2]*world.x_label.cylinders[1].lengthDirection[2]+world.x_label.cylinders[1].lengthDirection[3]*world.x_label.cylinders[1].lengthDirection[3]); \
body.sphere.r_shape[1] = (0.13146768576)+body.r_CM[1]; \
RWheel1.body.Q_start = TYMultibody.Frames.Quaternions.from_T(RWheel1.body.R_start.T,mwAux.28); \
mwAux.474 = (mwAux.438-0.03048374573278*mwAux.353)*Revolute1.R_rel.T[1,1]+0.00595810724813*mwAux.450+mwAux.463*Revolute1.R_rel.T[1,2]+((-0.03048374573278)*mwAux.429+mwAux.468)*Revolute1.R_rel.T[1,3]-mwAux.450*LWheel1.body.r_AG_a[2]; \
body.cylinder.e_aux1[1] = if body.cylinder.n_z_aux[1]*body.cylinder.n_z_aux[1]+body.cylinder.n_z_aux[3]*body.cylinder.n_z_aux[3]>0.000001 and b>c or c<d and (e<5 or e>6) then 0 else if abs(body.cylinder.n_z_aux[3])>0.000001 then 0 else 1; \
end SimpleEx; \
'

let complexCode2 = `
model SimpleEx
  Real a;
  Real b;
  Real c;
  Real d;
  Real e;

  // 假设 A 是一个 2x2 的实数矩阵
  Real A[2, 2];

  // 假设 body 是一个包含 cylinder, frame_a, I, r_CM, m, sphere 等组件的模型
  model Body
    model Cylinder
      Real rxvisobj[3];
      Real n_z_aux[3];
      Real e_x[3];
      Real e_aux1[3];
    end Cylinder;
    model FrameA
      Real R[3, 3];
    end FrameA;
    Real I[3, 3];
    Real r_CM[3];
    Real m;
    model Sphere
      Real r_shape[3];
    end Sphere;
    Cylinder cylinder;
    FrameA frame_a;
    Sphere sphere;
  end Body;
  Body body;

  // 假设 tr 是一个包含 y 的记录
  record TR
    Real y[2, 2];
  end TR;
  TR tr;

  // 假设 world 是一个包含 x_arrowLine 和 x_label 的模型
  model World
    model X_arrowLine
      String shapeType;
    end X_arrowLine;
    model X_label
      model CylinderInLabel
        Real lengthDirection[3];
        Real abs_n_x;
      end CylinderInLabel;
      CylinderInLabel cylinders[1];
    end X_label;
    X_arrowLine x_arrowLine;
    X_label x_label;
  end World;
  World world;

  // 假设 RWheel1 和 LWheel1 是包含 body 的模型
  model Wheel
    model BodyInWheel
      Real Q_start[4];
      Real R_start[3, 3];
      Real r_AG_a[3];
    end BodyInWheel;
    BodyInWheel body;
  end Wheel;
  Wheel RWheel1;
  Wheel LWheel1;

  // 假设 Revolute1 是一个包含 R_rel 的模型
  model Revolute
    Real R_rel[3, 3];
  end Revolute;
  Revolute Revolute1;

  // 假设 mwAux 是一个包含多个实数变量的记录或模型
  record MWAuxRecord
    Real var28;
    Real var474;
    Real var438;
    Real var353;
    Real var450;
    Real var463;
    Real var429;
    Real var468;
  end MWAuxRecord;
  MWAuxRecord mwAux;

  // 假设 TYMultibody 是一个包含 Frames 和 Quaternions 的包
  package TYMultibody
    package Frames
      function Quaternions.from_T = external "C" "TYMultibody_Frames_Quaternions_from_T";
    end Frames;
  end TYMultibody;

equation
  body.cylinder.rxvisobj[2] = body.frame_a.R[1,2] * body.cylinder.n_z_aux[3] + body.frame_a.R[2,2]*body.cylinder.e_x[2] + sin(tr.y[1,1]);
  A[1,1] = body.I[3,3] + body.r_CM[1]*body.m*body.r_CM[1] + body.r_CM[2]*body.m*body.r_CM[2];
  body.cylinder.e_aux1[1] = if body.cylinder.n_z_aux[1]*body.cylinder.n_z_aux[1] + body.cylinder.n_z_aux[3]*body.cylinder.n_z_aux[3] > 0.000001 then 0 else if abs(body.cylinder.n_z_aux[3]) > 0.000001 then 0 else 1;
  world.x_arrowLine.shapeType = "cylinder";
  world.x_label.cylinders[1].abs_n_x = sqrt(world.x_label.cylinders[1].lengthDirection[1]*world.x_label.cylinders[1].lengthDirection[1] + world.x_label.cylinders[1].lengthDirection[2]*world.x_label.cylinders[1].lengthDirection[2] + world.x_label.cylinders[1].lengthDirection[3]*world.x_label.cylinders[1].lengthDirection[3]);
  body.sphere.r_shape[1] = (0.13146768576) + body.r_CM[1];
  RWheel1.body.Q_start = TYMultibody.Frames.Quaternions.from_T(RWheel1.body.R_start, mwAux.var28);
  mwAux.var474 = (mwAux.var438 - 0.03048374573278*mwAux.var353)*Revolute1.R_rel[1,1] + 0.00595810724813*mwAux.var450 + mwAux.var463*Revolute1.R_rel[1,2] + ((-0.03048374573278)*mwAux.var429 + mwAux.var468)*Revolute1.R_rel[1,3] - mwAux.var450*LWheel1.body.r_AG_a[2];
  body.cylinder.e_aux1[1] = if body.cylinder.n_z_aux[1]*body.cylinder.n_z_aux[1] + body.cylinder.n_z_aux[3]*body.cylinder.n_z_aux[3] > 0.000001 and b > c or c < d and (e < 5 or e > 6) then 0 else if abs(body.cylinder.n_z_aux[3]) > 0.000001 then 0 else 1;
end SimpleEx;
`;

const testCode = complexCode2;
const tree = parser.parse(testCode);
// console.log(tree.rootNode.toString());

function treeToJson(node: Parser.SyntaxNode): any {
    const result: any = {
        type: node.type,
        startPosition: node.startPosition,
        endPosition: node.endPosition
    };

    const children = node.namedChildren.map(child => treeToJson(child));
    if (children.length > 0) {
        result.children = children;
    }

    return result;
}
function treeToJsonWithText(node: Parser.SyntaxNode, sourceCode: string): any {
    const result: any = {
        type: node.type,
        startPosition: node.startPosition,
        endPosition: node.endPosition,
        text: node.text // 获取节点的原始文本内容
    };

    const children = node.namedChildren.map(child => treeToJsonWithText(child, sourceCode));
    if (children.length > 0) {
        result.children = children;
    }

    return result;
}
// const jsonAst = treeToJson(tree.rootNode);
const jsonAstWithText = treeToJsonWithText(tree.rootNode, testCode);
// const jsonString = JSON.stringify(jsonAst, null, 2);
const jsonString = JSON.stringify(jsonAstWithText, null, 2);
const filePath = '../example/ast.json'; // 你想要保存的文件名和路径

try {
    fs.writeFileSync(filePath, jsonString, 'utf-8');
    console.log(`AST 已保存到 ${filePath}`);
} catch (error) {
    console.error('保存 AST 到文件时发生错误:', error);
}
