import requests
import json

base = "http://localhost/api"
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc1ODQyODcyLCJpYXQiOjE3NzU3NTY0NzIsImp0aSI6ImE4ODcyZGJkMjk0YTRmMTI5OTUwNGY2MzI4OGEzNzAzIiwidXNlcl9pZCI6OSwicm9sZSI6InN0dWRlbnQifQ.vH3CfOuE4ha6Qi3-oEWWnoizb6N3uZuz9UXv5Kb0EAk" # The token fetched earlier
headers = {"Authorization": f"Bearer {token}"}

# 1. Fetch available quizzes
res = requests.get(f"{base}/quizzes/quizzes/", headers=headers)
print("Quizzes:", res.status_code)
if res.status_code == 200 and len(res.json()) > 0:
    for q in res.json():
        if len(q['questions']) > 0:
            quiz = q
            break
    print("Using quiz:", quiz['id'])
    
    # 2. Submit an attempt
    answers = {str(quiz['questions'][0]['id']): quiz['questions'][0]['choices'][0]['id']}
    res2 = requests.post(f"{base}/quizzes/quizzes/{quiz['id']}/submit_quiz/", json={"answers": answers}, headers=headers)
    print("Submit Quiz:", res2.status_code, res2.json())
    
    # 3. Check my-attempt
    res3 = requests.get(f"{base}/quizzes/quizzes/{quiz['id']}/my-attempt/", headers=headers)
    print("My Attempt:", res3.status_code, json.dumps(res3.json(), indent=2))
