#include<bits/stdc++.h>
using namespace std;
using ll = long long;

int main(){
    vector<vector<int>> graph = {
        {1,0,0,0,0},
        {1,1,0,1,1},
        {0,0,0,1,1},
        {0,1,0,0,1},
        {1,0,1,0,0}
    };
    for(int i = 0; i < graph.size(); i++){
        for(int j = 0; j < graph[i].size(); j++){
            cout << graph[i][j] << " ";
        }
        cout << endl;
    }

}

