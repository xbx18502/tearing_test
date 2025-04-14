export class TarjanSCC {
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
  * 创建二分图的最大完美匹配，并返回转换后的邻接表表示的有向图
  * @param g 二分图的邻接矩阵，g[i][j]=1 表示从左侧节点i(方程)到右侧节点j(变量)有一条边
  * @returns 转换后的邻接表表示的有向图，其中匹配边方向被反转
  */
  public createMaximumPerfectMatching(g: number[][]): number[][] {
    const leftSize = g.length;    // 左侧节点数量（方程数）
    const rightSize = g[0].length; // 右侧节点数量（变量数）

    // 存储匹配关系，match[右侧节点索引] = 与之匹配的左侧节点，初始为-1表示未匹配
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

    // 创建邻接表表示的有向图
    // 总节点数为方程数+变量数
    const adjacencyList: number[][] = Array.from({ length: leftSize + rightSize }, () => []);

    // 构建有向图：
    // 1. 对于匹配边：从变量指向方程（方向翻转）
    // 2. 对于非匹配边：从方程指向变量（原方向）

    // 处理非匹配边：从方程(u)指向变量(v+leftSize)
    for (let u = 0; u < leftSize; u++) {
      for (let v = 0; v < rightSize; v++) {
        if (g[u][v] === 1 && match[v] !== u) {
          // 如果u和v之间有边且不是匹配边，保持原方向
          adjacencyList[u].push(v + leftSize);
        }
      }
    }

    // 处理匹配边：从变量(v+leftSize)指向方程(u)
    for (let v = 0; v < rightSize; v++) {
      if (match[v] !== -1) {
        const u = match[v];
        // 翻转匹配边的方向：从变量指向方程
        adjacencyList[v + leftSize].push(u);
      }
    }

    return adjacencyList;

    /**
     * DFS查找增广路径
     * @param u 当前左侧节点（方程）
     * @returns 是否找到增广路径
     */
    function dfs(u: number): boolean {
      if (visited[u]) return false;
      visited[u] = true;

      // 尝试从u到右侧每个节点v连接
      for (let v = 0; v < rightSize; v++) {
        // 检查是否有从u到v的边
        if (g[u][v] === 1) {
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




  /**
   * 根据相关图的SCC拓扑排序，重排原始方程矩阵g以获得块三角形式(BTF)。
   *
   * 关键假设:
   * - g: 原始 n x n 矩阵 (例如 7x7)。
   * - adjacencyList: 描述依赖关系的图 (例如 2n 个节点)。
   * - scc: 长度为 2n 的数组, scc[i] 是节点 i 的 SCC ID。
   * - 映射: 节点 0..n-1 映射到 g 的行 0..n-1。
   * 节点 n..2n-1 映射到 g 的列 0..n-1 (节点 k -> 列 k-n)。
   *
   * @param adjacencyList 依赖关系图的邻接表。
   * @param g 要重排的原始 n x n 矩阵。
   * @param scc 节点到其 SCC ID 的映射数组。
   * @returns 重排后的矩阵 g'。如果出错则可能返回原始矩阵 g。
   */
  public reorder(adjacencyList: number[][], g: number[][], scc: number[]): 
  {reorderedG: number[][], rowPermutation: number[], colPermutation: number[]} {
    const matrixSize = g.length; // n (例如 7)
    
    if (matrixSize === 0) {
      return { reorderedG: [], rowPermutation: [], colPermutation: [] }; // 返回空矩阵和置换
    }
    if (!g.every(row => row.length === matrixSize)) {
      console.error("错误: 输入矩阵 g 不是方阵。");
      return { reorderedG: g, rowPermutation: [], colPermutation: [] }; // 返回原始矩阵
    }

    // 预期节点数，基于映射假设
    const expectedNodes = 2 * matrixSize;
    const numNodes = adjacencyList.length; // 图中的实际节点数

    // 基础验证 (可以根据需要调整严格程度)
    if (scc.length === 0) {
      console.error("错误: SCC 数组为空。");
      return { reorderedG: g, rowPermutation: [], colPermutation: [] }; // 返回原始矩阵
    }
    if (numNodes === 0) {
      console.warn("警告: adjacencyList 为空，无法进行重排。");
      return { reorderedG: g, rowPermutation: [], colPermutation: [] }; // 返回原始矩阵
    }
    // 可选：检查 scc 数组长度是否符合预期
    if (scc.length !== numNodes) {
      console.warn(`警告: scc 数组长度 (${scc.length}) 与 adjacencyList 节点数 (${numNodes}) 不匹配。将基于 scc 数组的长度和内容继续，但这可能指示输入有问题。`);
      // 如果 scc 长度决定了节点范围，可能需要调整 numNodes
      // numNodes = scc.length; // 取决于哪个是更可靠的来源
    }


    // --- 1. 构建 SCC 图（缩点图） ---
    const maxSccId = scc.reduce((maxId, currentId) => Math.max(maxId, currentId), -1);
    if (maxSccId < 0) {
      console.error("错误: 未找到有效的 SCC ID (>= 0)。");
      return { reorderedG: g, rowPermutation: [], colPermutation: [] }; // 返回原始矩阵
    }
    const numSCCs = maxSccId + 1;

    const sccAdj: Set<number>[] = new Array(numSCCs).fill(0).map(() => new Set<number>());
    const sccInDegree: number[] = new Array(numSCCs).fill(0);

    for (let u = 0; u < numNodes; u++) {
      // 检查 u 是否在 scc 数组的有效范围内
      if (u >= scc.length) continue;
      const sccU = scc[u];
      // 检查 sccU 是否有效
      if (sccU < 0 || sccU >= numSCCs) continue;

      // 检查 u 是否在 adjacencyList 的有效范围内
      if (u >= adjacencyList.length) continue;

      for (const v of adjacencyList[u]) {
        // 检查 v 是否在 scc 数组的有效范围内
        if (v < 0 || v >= scc.length) continue;
        const sccV = scc[v];
        // 检查 sccV 是否有效
        if (sccV < 0 || sccV >= numSCCs) continue;

        // 如果是跨 SCC 的边，则在缩点图中添加边
        if (sccU !== sccV) {
          if (!sccAdj[sccU].has(sccV)) {
            sccAdj[sccU].add(sccV);
            sccInDegree[sccV]++;
          }
        }
      }
    }

    // --- 2. 拓扑排序 SCC (Kahn 算法) ---
    const queue: number[] = []; // 使用数组模拟队列
    for (let i = 0; i < numSCCs; i++) {
      if (sccInDegree[i] === 0) {
        queue.push(i);
      }
    }
// --- 3. 生成行和列的置换 ---
const rowPermutation: number[] = []; // 不需要预设大小，动态添加
const colPermutation: number[] = [];
    const topologicalOrderSCC: number[] = [];
    while (queue.length > 0) {
      const sccU = queue.shift()!; // Dequeue
      topologicalOrderSCC.push(sccU);

      for (const sccV of sccAdj[sccU]) {
        sccInDegree[sccV]--;
        if (sccInDegree[sccV] === 0) {
          queue.push(sccV);
        }
      }
    }

    // 检查 SCC 图中是否有环
    if (topologicalOrderSCC.length !== numSCCs) {
      console.error("错误: SCC 缩点图中检测到环。无法进行拓扑排序以获得 BTF。");
      // BTF 要求缩点图是 DAG
      return { reorderedG: g, rowPermutation: [], colPermutation: [] }; // 返回原始矩阵
    }
    topologicalOrderSCC.reverse(); // 反转拓扑排序结果

    // 遍历拓扑排序后的 SCC
    for (const currentSccId of topologicalOrderSCC) {
      // 找出属于当前 SCC 的行 (节点 0 到 n-1)
      for (let r = 0; r < matrixSize; r++) {
        // 检查 r 是否在 scc 数组范围内
        if (r < scc.length && scc[r] === currentSccId) {
          rowPermutation.push(r);
        }
      }
      // 找出属于当前 SCC 的列 (节点 n 到 2n-1)
      for (let c = 0; c < matrixSize; c++) {
        const nodeIndex = c + matrixSize; // 映射到节点索引
        // 检查 nodeIndex 是否在 scc 数组范围内
        if (nodeIndex < scc.length && scc[nodeIndex] === currentSccId) {
          colPermutation.push(c); // 添加的是列索引 c
        }
      }
    }

    // 验证置换是否包含了所有行和列
    if (rowPermutation.length !== matrixSize || colPermutation.length !== matrixSize) {
      console.error(`错误: 生成的置换不完整。行数: ${rowPermutation.length}/${matrixSize}, 列数: ${colPermutation.length}/${matrixSize}。请检查映射假设或输入数据。`);
      console.error("生成的行置换:", rowPermutation);
      console.error("生成的列置换:", colPermutation);
      return { reorderedG: g, rowPermutation: [], colPermutation: [] }; // 返回原始矩阵，因为无法正确重排
    }


    // --- 4. 重排矩阵 g ---
    const reorderedG: number[][] = new Array(matrixSize).fill(0).map(() => new Array(matrixSize).fill(0));
    for (let i = 0; i < matrixSize; i++) { // 新矩阵的行索引
      for (let j = 0; j < matrixSize; j++) { // 新矩阵的列索引
        const originalRow = rowPermutation[i]; // 获取对应的原始行号
        const originalCol = colPermutation[j]; // 获取对应的原始列号
        reorderedG[i][j] = g[originalRow][originalCol];
      }
    }

    return {reorderedG, rowPermutation, colPermutation};
  }
}


let graph7: number[][] = [
  [],
  [5, 6, 9],
  [8],
  [9],
  [5],
  [0],
  [3],
  [4],
  [1],
  [2]
]

let graph6: number[][] = [
  [1, 0, 0, 0, 0],
  [1, 1, 0, 1, 1],
  [0, 0, 0, 1, 1],
  [0, 1, 0, 0, 1],
  [1, 0, 1, 0, 0]
]

let graph8: number[][] = [
  [1, 0, 1, 0, 0],
  [1, 1, 0, 1, 1],
  [1, 0, 0, 0, 0],
  [0, 0, 0, 1, 1],
  [0, 1, 0, 0, 1]
]

let graph9: number[][] = [
  [1, 0, 1, 1, 1],
  [0, 0, 1, 1, 0],
  [1, 0, 0, 1, 0],
  [0, 0, 0, 0, 1],
  [0, 1, 0, 0, 1]
]

let graph10: number[][] = [
  [0, 0, 1, 0, 0, 0, 0],
  [1, 1, 0, 0, 0, 1, 0],
  [1, 0, 1, 0, 0, 1, 0],
  [0, 1, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 0, 0],
  [1, 1, 1, 0, 0, 0, 0]
]

let graph11: number[][] = [
  [1],
  [2, 4],
  [0, 3, 5],
  [2],
  [5, 6],
  [4, 6, 7],
  [7],
  [8],
  [6]
]

let graph12: number[][] = [
  [1, 0, 1, 0],
  [0, 0, 0, 1],
  [0, 1, 0, 1],
  [0, 1, 1, 0]
]
// const components1 = findStrongConnectedComponents(graph7);

// console.log("每个节点所属的强连通分量编号:", components1);
function test() {
  const originalGraph = graph10;
  const tarjan = new TarjanSCC();
  const maximumPerfectMatching = tarjan.createMaximumPerfectMatching(originalGraph);
  console.log("原邻接矩阵:\n");
  for (let u = 0; u < originalGraph.length; u++) {
    console.log(originalGraph[u].join(" "));
  }
  console.log("翻转后的邻接矩阵:", maximumPerfectMatching);

  const components = tarjan.strong(maximumPerfectMatching);
  console.log("强连通分量:", components);
  const reorderResult = tarjan.reorder(maximumPerfectMatching, originalGraph, components);
  const reorderedGraph = reorderResult.reorderedG;
  const rowPermutation = reorderResult.rowPermutation;
  const colPermutation = reorderResult.colPermutation;
  console.log("重排序结果");
  for (let u = 0; u < reorderedGraph.length; u++) {
    console.log(reorderedGraph[u].join(" "));
  }
  console.log("行置换:", rowPermutation);
  console.log("列置换:", colPermutation);
}

test();






