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


const tree = parser.parse(sourceCode);
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

const jsonAst = treeToJson(tree.rootNode);
const jsonString = JSON.stringify(jsonAst, null, 2);
const filePath = '../example/ast.json'; // 你想要保存的文件名和路径

try {
  fs.writeFileSync(filePath, jsonString, 'utf-8');
  console.log(`AST 已保存到 ${filePath}`);
} catch (error) {
  console.error('保存 AST 到文件时发生错误:', error);
}
