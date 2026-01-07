#!/usr/bin/env python3
import math

class RecommendationEngine:
    def __init__(self):
        self.users = {}
    
    def add_rating(self, user, item, rating):
        if user not in self.users:
            self.users[user] = {}
        self.users[user][item] = rating
    
    def cosine_similarity(self, user1, user2):
        common_items = set(self.users[user1].keys()) & set(self.users[user2].keys())
        
        if not common_items:
            return 0
        
        dot_product = sum(self.users[user1][item] * self.users[user2][item] 
                         for item in common_items)
        
        mag1 = math.sqrt(sum(r**2 for r in self.users[user1].values()))
        mag2 = math.sqrt(sum(r**2 for r in self.users[user2].values()))
        
        if mag1 == 0 or mag2 == 0:
            return 0
        
        return dot_product / (mag1 * mag2)
    
    def recommend(self, target_user, n=5):
        if target_user not in self.users:
            return []
        
        # Find similar users
        similarities = []
        for user in self.users:
            if user != target_user:
                sim = self.cosine_similarity(target_user, user)
                similarities.append((user, sim))
        
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        # Get recommendations from similar users
        recommendations = {}
        target_items = set(self.users[target_user].keys())
        
        for user, similarity in similarities[:3]:
            for item, rating in self.users[user].items():
                if item not in target_items:
                    if item not in recommendations:
                        recommendations[item] = 0
                    recommendations[item] += rating * similarity
        
        # Sort and return top N
        sorted_recs = sorted(recommendations.items(), key=lambda x: x[1], reverse=True)
        return sorted_recs[:n]

# Test
engine = RecommendationEngine()

# Add ratings (user, item, rating)
engine.add_rating('Alice', 'Movie1', 5)
engine.add_rating('Alice', 'Movie2', 3)
engine.add_rating('Alice', 'Movie3', 4)

engine.add_rating('Bob', 'Movie1', 4)
engine.add_rating('Bob', 'Movie2', 2)
engine.add_rating('Bob', 'Movie4', 5)

engine.add_rating('Charlie', 'Movie1', 5)
engine.add_rating('Charlie', 'Movie3', 4)
engine.add_rating('Charlie', 'Movie4', 4)

print("Recommendations for Alice:")
recs = engine.recommend('Alice')
for item, score in recs:
    print(f"  {item}: {score:.2f}")
