import re
from pprint import pprint
import pdb
import json

def parse_equation(equation):
    """解析等式表达式为计算图结构"""
    left, right = equation.split('=', 1)
    left_var = left.strip()
    tokens = tokenize(right.strip())
    parser = Parser(tokens)
    ast = parser.parse()
    return {'output': left_var, 'expression': ast}

def get_ast(equation):
    """获取计算图结构"""
    tokens = tokenize(equation)
    parser = Parser(tokens)
    ast = parser.parse()
    return ast


def tokenize(expr):
    """改进的词法分析器，支持带.和[]的变量名"""
    token_spec = [
        ('num',r'\d+\.?\d*([eE][+-]?\d+)?'), # 大数
        # ('num', r'\d+\.?\d*|\.\d+'),          # 数字
        # ('var', r'[a-zA-Z_][\w.]*\[+'),          # 变量（支持.的成员访问）
        ('operator', r'[+\-*/]'),             # 运算符
        ('lparen', r'\('),                    # 左圆括号
        ('rparen', r'\)'),                    # 右圆括号
        ('lbracket', r'\['),                  # 左方括号（新增）
        ('rbracket', r'\]'),                  # 右方括号（新增）
        ('comma', r','),                      # 逗号（新增）
        ('keywordif', r'if '),         # if,else,then,keyword 关键字（新增）
        ('keywordthen', r' then '),         # if,else,then,keyword 关键字（新增）
        ('keywordelse', r' else '),         # if,else,then,keyword 关键字（新增）
        ('whitespace', r'\s+'),               # 空格

        ('compare', r'>=|<=|==|!=|>|<'),      # condition关键字（新增）
        ('and', r'and'),                      # and关键字（新增）
        ('or', r'or'),                        # or关键字（新增）
        ('not', r'not'),                      # not关键字（新增）
        ('var', r'[a-zA-Z_][\w.]*'),          # 变量（支持.的成员访问）
        ('quotes', r'\"[^\"]*\"'),           # 引号（新增）
        ('point', r'.'),                      # 点号（新增）
    ]
    tokens = []
    pos = 0
    while pos < len(expr):
        for tok_type, pattern in token_spec:
            regex = re.compile(pattern)
            m = regex.match(expr, pos)
            if m:
                if tok_type != 'whitespace':
                    # 处理带[]的变量名
                    # if tok_type == 'var' and expr[m.end()] in ('[', '('):
                        # continue  # 防止提前匹配不完整
                    tokens.append({'type': tok_type, 'value': m.group()})
                pos = m.end()
                break
        # else:
        #     raise ValueError(f'Invalid character at position {pos}: {expr[pos]}')
    return tokens

class Parser:
    """支持对象属性和数组索引的递归下降解析器"""
    def __init__(self, tokens):
        self.tokens = tokens
        self.pos = 0
        self.quotesList = []

    def parse(self):
        return self.parse_expression()

    def peek(self):
        return self.tokens[self.pos] if self.pos < len(self.tokens) else None

    def consume(self, expected_type=None):
        if self.pos >= len(self.tokens):
            raise ValueError('Unexpected end of input')
        token = self.tokens[self.pos]
        if expected_type and token['type'] != expected_type:
            raise ValueError(f'Expected {expected_type}, got {token["type"]}')
        self.pos += 1
        return token

    def parse_expression(self):
        node = self.parse_term()
        while self.peek() and self.peek()['type'] == 'operator' and self.peek()['value'] in ('+', '-'):
            op = self.consume()
            right = self.parse_term()
            node = {
                'type': 'binary_op',
                'operator': op['value'],
                'left': node,
                'right': right
            }
        return node
    def parse_if_else(self):
        self.consume('keywordif')
        condition = self.parse_condition()
        self.consume('keywordthen')
        then_expr = self.parse_expression()
        if self.peek() and self.peek()['type'] == 'keywordelse' and self.peek()['value'] == r' else ':
            self.consume(r'keywordelse')
            else_expr = self.parse_expression()
            return {
                'type': 'if_else',
                'condition': condition,
                'then_expr': then_expr,
                'else_expr': else_expr
        
            }
        
    def parse_term(self):
        node = self.parse_factor()
        while self.peek() and self.peek()['type'] == 'operator' and self.peek()['value'] in ('*', '/'):
            op = self.consume()
            right = self.parse_factor()
            node = {
                'type': 'binary_op',
                'operator': op['value'],
                'left': node,
                'right': right
            }
        return node


    def parse_condition(self):
        """解析条件表达式，支持and/or连接多个比较条件"""
        if self.peek() and self.peek()['type'] == 'lparen':
            self.consume('lparen')
            left = self.parse_condition()
            self.consume('rparen')
        else:
            left = self.parse_comparison()
        while self.peek() and self.peek()['type'] in ('and', 'or'):
            op = self.consume()
            if self.peek() and self.peek()['type'] == 'lparen':
                self.consume('lparen')
                right = self.parse_condition()
                self.consume('rparen')
            else:
                right = self.parse_comparison()
            left = {
                'type': 'logical_op',
                'operator': op['value'],
                'left': left,
                'right': right
            }
        return left
    # def parse_condition(self):
    #     node = self.parse_expression()
    #     while self.peek() and self.peek()['type'] == 'compare':
    #         op = self.consume()
    #         right = self.parse_factor()
    #         node = {
    #             'type': 'compare',
    #             'operator': op['value'],
    #             'left': node,
    #             'right': right
    #         }
    #     return node

    def parse_comparison(self):
        """解析单个比较表达式"""
        left = self.parse_expression()
        if self.peek() and self.peek()['type'] == 'compare':
            op = self.consume()
            right = self.parse_expression()
            return {
                'type': 'compare',
                'operator': op['value'],
                'left': left,
                'right': right
            }
        return left


    def parse_factor(self):
        if self.peek() and self.peek()['type'] == 'keywordif' and self.peek()['value'] == r'if ':
            return self.parse_if_else()
        token = self.peek()
        if not token:
            raise ValueError('Unexpected end of input')

        # 处理一元运算符
        if token['type'] == 'operator' and token['value'] in ('+', '-'):
            op = self.consume()
            return {
                'type': 'unary_op',
                'operator': op['value'],
                'arg': self.parse_factor()
            }

        # 处理括号表达式
        if token['type'] == 'lparen':
            self.consume('lparen')
            node = self.parse_expression()
            # try:
            self.consume('rparen')
            # except:
                # pdb.set_trace()
            return self.handle_postfix(node)
        # 处理数字
        if token['type'] == 'num':
            if '.' in token['value'] or 'e' in token['value']:
                num = float(token['value'])
            else:
                num = int(token['value'])

            self.consume()
            return {'type': 'num', 'value': num}

        # 处理字符串
        if token['type'] == 'quotes':
            quotes = self.consume()['value']
            self.quotesList.append(quotes)
            return {'type': 'quotes', 'value': quotes}

        # # 处理if-else表达式
        # if token['type'] == 'keywordif' and token['value'] == r'if ':
        #     self.consume(r'keywordif')
        #     condition = self.parse_condition()
        #     self.consume(r'keywordthen')
        #     then_expr = self.parse_expression()

        #     if self.peek() and self.peek()['type'] == 'keyword' and self.peek()['value'] == r'else ':
        #         self.consume(r'keywordelse')
        #         else_expr = self.parse_expression()
        #         return {
        #             'type': 'if_else',
        #             'condition': condition,
        #             'then_expr': then_expr,
        #             'else_expr': else_expr
        #         }
                # 处理变量/函数调用
        if token['type'] == 'var':
            var_name = self.consume()['value']
            node = {'type': 'var', 'name': var_name}

            return self.handle_postfix(node)

        raise ValueError(f'Unexpected token: {token["type"]} ({token["value"]})')

    def handle_postfix(self, node):
        """处理后缀操作（函数调用和索引访问）"""
        while True:
            # 函数调用处理
            if self.peek() and self.peek()['type'] == 'lparen':
                self.consume('lparen')
                indices = self.parse_expression_rparen_list()
                self.consume('rparen')
                node = {
                    'type': 'func_call',
                    'func': node,
                    'args': indices
                }
            # 数组索引处理
            elif self.peek() and self.peek()['type'] == 'lbracket':
                self.consume('lbracket')
                indices = self.parse_expression_list()
                self.consume('rbracket')
                subnodes = []
                while self.peek() and self.peek()['type'] == 'point':
                    self.consume('point')
                    var_name = self.consume()['value']
                    if self.peek() and self.peek()['type'] == 'lbracket':
                        self.consume('lbracket')
                        nowindices = self.parse_expression_rparen_list()
                        self.consume('rbracket')
                        newnodes = {
                            'type': 'var',
                            'name': var_name,
                            'args': nowindices
                        }
                        subnodes.append(newnodes)


                node = {
                    'type': 'var',
                    'object': node,
                    'indices': indices,
                    'subnodes': subnodes
                }
            else:
                break
        return node

    def parse_expression_list(self):
        """解析逗号分隔的表达式列表（用于数组索引）"""
        exprs = []
        if self.peek() and self.peek()['type'] != 'rbracket':
            exprs.append(self.parse_expression())
            while self.peek() and self.peek()['type'] == 'comma':
                self.consume('comma')
                exprs.append(self.parse_expression())
        return exprs

    def parse_expression_rparen_list(self):
        """解析逗号分隔的表达式列表（用于函数参数索引）"""
        exprs = []
        if self.peek() and self.peek()['type'] != 'rparen':
            exprs.append(self.parse_expression())
            while self.peek() and self.peek()['type'] == 'comma':
                self.consume('comma')
                exprs.append(self.parse_expression())
        return exprs


# 测试用例
if __name__ == "__main__":
    # complex_equation1 = "body.cylinder.rxvisobj[2] = body.frame_a.R.T[1,2] * body.cylinder.n_z_aux[3] + body.frame_a.R.T[2,2]*body.cylinder.e_x[2] + sin(tr.y[1,1])"
    # complex_equation3 = "A[1,1] = body.I[3,3]+body.r_CM[1]*body.m*body.r_CM[1]+body.r_CM[2]*body.m*body.r_CM[2]"
    # complex_equation3 = "body.cylinder.e_aux1[1] = if body.cylinder.n_z_aux[1]*body.cylinder.n_z_aux[1]+body.cylinder.n_z_aux[3]*body.cylinder.n_z_aux[3]>0.000001 then 0 else if abs(body.cylinder.n_z_aux[3])>0.000001 then 0 else 1"
    # complex_equation3 = 'world.x_arrowLine.shapeType = "cylinder"'
    # complex_equation3 = 'world.x_label.cylinders[1].abs_n_x = sqrt(world.x_label.cylinders[1].lengthDirection[1].a[3,4,5].b[4,5,6].c[6,7].d[6]*world.x_label.cylinders[1].lengthDirection[1]+world.x_label.cylinders[1].lengthDirection[2]*world.x_label.cylinders[1].lengthDirection[2]+world.x_label.cylinders[1].lengthDirection[3]*world.x_label.cylinders[1].lengthDirection[3])'
    #complex_equation3 = 'body.sphere.r_shape[1] = (0.13146768576)+body.r_CM[1]'
    # complex_equation3 = "RWheel1.body.Q_start = TYMultibody.Frames.Quaternions.from_T(RWheel1.body.R_start.T,mwAux.28);"
    complex_equation3 = "mwAux.474 = (mwAux.438-0.03048374573278*mwAux.353)*Revolute1.R_rel.T[1,1]+0.00595810724813*mwAux.450+mwAux.463*Revolute1.R_rel.T[1,2]+((-0.03048374573278)*mwAux.429+mwAux.468)*Revolute1.R_rel.T[1,3]-mwAux.450*LWheel1.body.r_AG_a[2]"
    
    # complex_equation3 = "body.cylinder.e_aux1[1] = if body.cylinder.n_z_aux[1]*body.cylinder.n_z_aux[1]+body.cylinder.n_z_aux[3]*body.cylinder.n_z_aux[3]>0.000001 and b>c or c<d and (e<5 or e>6) then 0 else if abs(body.cylinder.n_z_aux[3])>0.000001 then 0 else 1"
    
    result = [complex_equation3]
    results = json.dumps(result, indent=4)


    # 解析复杂等式
    ast1 = parse_equation(complex_equation3)
    pprint(ast1, depth=4)
    # print("result:",ast1['expression']['left']['value'] - 0.13146768576)
    with open('./result.json', 'w') as f:
        json.dump(ast1, f, indent=4)
    pprint(ast1, depth=4)

    # from JAXCodeGeneratorFromCalGraph import JAXCodeGenerator
    # generator = JAXCodeGenerator(results)
    # generator.generate_code()
    # print(generator.code)