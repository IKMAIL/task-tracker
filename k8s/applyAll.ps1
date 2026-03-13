cd c:/Users/moham/GitHub/task-tracker/k8s
Get-ChildItem -Path . -Recurse -Filter *.yaml | ForEach-Object { kubectl apply -f $_.FullName }