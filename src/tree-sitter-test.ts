import Parser from 'tree-sitter';
import * as fs from 'fs';
// 或者
// const Parser = require('tree-sitter');

// 假设你的 .node 文件在你的 tree-sitter-modelica 包的 build/Release/ 目录下
// 并且你已经将 tree-sitter-modelica 安装为你的 TypeScript 项目的依赖
// import Modelica from 'tree-sitter-modelica';
const Modelica: Parser.Language = require('/mnt/tree-sitter-modelica/build/Release/tree_sitter_modelica_binding.node');

// import Modelica = require('tree-sitter-modelica');

// import Modelica from '../tree-sitter-modelica/build/Release/tree_sitter_modelica_binding.node';

const parser = new Parser();
// console.log("modelica parser:", Modelica);

parser.setLanguage(Modelica);

let sourceCode = 'model SimpleEx Real a, b, c, d, e; equation sqrt ( a ) = 65 " Equation f1"; d = a /( b* e ) " Equation f2"; e = d ^3 " Equation f3"; b = sqrt ( e ) " Equation f4"; 0 = a ^2 + c " Equation f5"; end SimpleEx ; ';
const codePath: string = '../example/doublePendulum.mo';
const simpleCode = fs.readFileSync(codePath, 'utf-8');
const testCode = simpleCode;
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
const filePath = '../tmp/ast.json'; // 你想要保存的文件名和路径

try {
  fs.writeFileSync(filePath, jsonString, 'utf-8');
  console.log(`AST 已保存到 ${filePath}`);
} catch (error) {
  console.error('保存 AST 到文件时发生错误:', error);
}
