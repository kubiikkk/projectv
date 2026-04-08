import os
import json

extensions = [".html", ".js", ".css"]

result = {
    "html": 0,
    "css": 0,
    "js": 0,
    "total": 0
}

for root, dirs, files in os.walk("."):
    for file in files:
        for ext in extensions:
            if file.endswith(ext):
                path = os.path.join(root, file)

                try:
                    with open(path, "r", encoding="utf-8") as f:
                        lines = len(f.readlines())

                        result[ext[1:]] += lines
                        result["total"] += lines

                except:
                    print("Error reading:", path)

print("Lines of code:", result)