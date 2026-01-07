#!/usr/bin/env python3

class BTreeNode:
    def __init__(self, leaf=True):
        self.keys = []
        self.children = []
        self.leaf = leaf

class BTree:
    def __init__(self, t=3):
        self.root = BTreeNode()
        self.t = t  # Minimum degree
    
    def search(self, k, node=None):
        if node is None:
            node = self.root
        
        i = 0
        while i < len(node.keys) and k > node.keys[i]:
            i += 1
        
        if i < len(node.keys) and k == node.keys[i]:
            return True
        
        if node.leaf:
            return False
        
        return self.search(k, node.children[i])
    
    def insert(self, k):
        root = self.root
        if len(root.keys) == (2 * self.t) - 1:
            new_root = BTreeNode(leaf=False)
            new_root.children.append(self.root)
            self.root = new_root
        
        self._insert_non_full(self.root, k)
    
    def _insert_non_full(self, node, k):
        i = len(node.keys) - 1
        
        if node.leaf:
            node.keys.append(None)
            while i >= 0 and k < node.keys[i]:
                node.keys[i + 1] = node.keys[i]
                i -= 1
            node.keys[i + 1] = k
        else:
            while i >= 0 and k < node.keys[i]:
                i -= 1
            i += 1
            self._insert_non_full(node.children[i], k)

if __name__ == '__main__':
    btree = BTree(t=3)
    for key in [10, 20, 5, 6, 12, 30, 7, 17]:
        btree.insert(key)
    
    print("Search 6:", btree.search(6))
    print("Search 15:", btree.search(15))
