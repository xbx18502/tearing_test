class TarjanSCC {
  // 使用初始值或声明为可选属性来避免TS2564错误
  private n: number = 0;
  private count: number = 0;
  private comp: number = 0;
  private num: number[] = [];
  private low: number[] = [];
  private answer: number[] = [];
  private onStack: boolean[] = [];
  private stack: number[] = [];
  private graph: number[][] = [];

  /**
   * 计算图中的强连通分量
   * @param g 邻接表表示的图
   * @returns 每个节点所属的强连通分量编号
   */
  public strong(g: number[][]): number[] {
    this.graph = g;
    this.n = this.graph.length;
    this.num = new Array(this.n).fill(0);
    this.low = new Array(this.n).fill(0);
    this.answer = new Array(this.n).fill(0);
    this.onStack = new Array(this.n).fill(false);
    this.stack = [];
    this.count = 0;
    this.comp = 0;

    // 对每个未访问的节点进行DFS
    for (let x = 0; x < this.n; x++) {
      this.DFS(x);
    }

    return this.answer;
  }

  /**
   * Tarjan算法的DFS过程
   * @param v 当前访问的节点
   */
  private DFS(v: number): void {
    // 如果节点已经被访问，则直接返回
    if (this.num[v] !== 0) return;
    
    // 为当前节点分配DFS序号和初始low值
    this.num[v] = this.low[v] = ++this.count;
    this.stack.push(v);
    this.onStack[v] = true;

    // 先递归访问所有邻居节点
    for (const w of this.graph[v]) {
      this.DFS(w);
    }

    // 然后更新当前节点的low值
    for (const w of this.graph[v]) {
      if (this.onStack[w]) {
        this.low[v] = Math.min(this.low[v], this.low[w]);
      }
    }

    // 如果当前节点是强连通分量的根节点
    if (this.num[v] === this.low[v]) {
      while (true) {
        const x = this.stack.pop()!;
        this.onStack[x] = false;
        this.answer[x] = this.comp;
        if (x === v) break;
      }
      this.comp++;
    }
  }

  /**
 * 创建二分图的最大完美匹配，并返回边翻转后的邻接矩阵
 * @param g 二分图的邻接矩阵，g[i][j]=1 表示从左侧节点i到右侧节点j有一条边
 * @returns 翻转后的邻接矩阵，匹配中的边方向被反转
 */
public createMaximumPerfectMatching(g: number[][]): number[][] {
  const leftSize = g.length;
  const rightSize = g[0].length;
  
  // 复制原邻接矩阵，避免修改原始数据
  const result: number[][] = Array.from({ length: leftSize }, () => Array(rightSize).fill(0));
  for (let i = 0; i < leftSize; i++) {
    for (let j = 0; j < rightSize; j++) {
      result[i][j] = g[i][j];
    }
  }
  
  // 存储匹配关系，match[右侧节点索引] = 与之匹配的左侧节点
  const match: number[] = Array(rightSize).fill(-1);
  
  // 用于DFS的访问标记
  const visited: boolean[] = Array(leftSize).fill(false);
  
  // 匈牙利算法的主循环
  let matchingSize = 0;
  for (let u = 0; u < leftSize; u++) {
    // 每次尝试为一个新的左侧节点寻找匹配时，重置visited数组
    visited.fill(false);
    
    if (dfs(u)) {
      matchingSize++;
    }
  }
  
  // 检查是否为完美匹配
  const isPerfectMatching = matchingSize === Math.min(leftSize, rightSize);
  if (!isPerfectMatching) {
    console.warn("警告：未找到完美匹配，返回的是最大匹配");
  }
  
  // 根据匹配关系翻转边的方向
  // 创建一个新的方向翻转后的邻接矩阵
  const flippedResult: number[][] = Array.from({ length: rightSize }, () => Array(leftSize).fill(0));
  
  for (let v = 0; v < rightSize; v++) {
    if (match[v] !== -1) {
      const u = match[v];
      // 翻转匹配边的方向：(u,v) 变为 (v,u)
      flippedResult[v][u] = 1;
    }
  }


  const adjacencyList: number[][] = Array.from({ length: leftSize+rightSize }, () => []);
  for (let u = 0; u < leftSize; u++) {
    for (let v = 0; v < rightSize; v++) {
      if (result[u][v] === 1 && match[v] !== u) {
        // 如果u和v之间有边且不是匹配边，则添加到邻接表
        adjacencyList[u].push(v + leftSize); // 将右侧节点索引偏移
      }
    }
  }
  // 将匹配边添加到邻接表
  for (let v = 0; v < rightSize; v++) {
    if (match[v] !== -1) {
      const u = match[v];
      adjacencyList[v+leftSize].push(u); // 添加匹配边

    }
  }
  return adjacencyList;
  
  /**
   * DFS查找增广路径
   * @param u 当前左侧节点
   * @returns 是否找到增广路径
   */
  function dfs(u: number): boolean {
    if (visited[u]) return false;
    visited[u] = true;
    
    // 尝试从u到右侧每个节点连接
    for (let v = 0; v < rightSize; v++) {
      // 检查是否有从u到右侧节点v的边
      if (result[u][v] === 1) {
        // 如果右侧节点v未匹配或者v的当前匹配可以找到其他选择
        if (match[v] === -1 || dfs(match[v])) {
          // 建立新的匹配
          match[v] = u;
          return true;
        }
      }
    }
    
    return false;
  }
}
}

// 使用示例
function findStrongConnectedComponents(graph: number[][]): number[] {
  const tarjan = new TarjanSCC();
  return tarjan.strong(graph);
}

// 示例：创建一个有向图并找出其强连通分量
const graph1: number[][] = [
  [1],          // 节点0 -> 节点1
  [2],          // 节点1 -> 节点2
  [0, 3],       // 节点2 -> 节点0,3
  [4],          // 节点3 -> 节点4
  [5],          // 节点4 -> 节点5
  [6],          // 节点5 -> 节点6
  [4]           // 节点6 -> 节点4
];

let graph2 : number[][] = [
  [5],
  [5,6,8,9],
  [8,9],
  [6,9],
  [5,7],
  [0,1,4],
  [1,3],
  [4],
  [1,2],
  [1,2,3]
];

let graph3 : number[][] = [
  [1],
  [2,3],
  [0,7],
  [4],
  [5,6],
  [4],
  [4],
  [4,9],
  [7],
  [8]
];

let graph4 : number[][] = [
  [0],
  [0,1,3,4],
  [3,4],
  [1],
  [0,2]
];

let graph5 : number[][] = [
  [5],
  [5,6,8,9],
  [8,9],
  [6,9],
  [5,7]
]

let graph6 : number[][] = [
  [5],
  [8],
  [9],
  [6],
  [7],
  [1,4],
  [1] ,
  [],
  [2],
  [0,3]
]

let graph7 : number[][] = [
  [],
  [5,6,9],
  [8],
  [9],
  [5],
  [0],
  [3],
  [4],
  [1],
  [2]
]

let graph8 : number[][] = [
  [1,0,0,0,0],
  [1,1,0,1,1],
  [0,0,0,1,1],
  [0,1,0,0,1],
  [1,0,1,0,0]
]

// const components1 = findStrongConnectedComponents(graph7);

// console.log("每个节点所属的强连通分量编号:", components1);

const tarjan = new TarjanSCC();
const maximumPerfectMatching = tarjan.createMaximumPerfectMatching(graph8);
console.log("翻转后的邻接矩阵:", maximumPerfectMatching);

console.log("强连通分量:", tarjan.strong(maximumPerfectMatching));


