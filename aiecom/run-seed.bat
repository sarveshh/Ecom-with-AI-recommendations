@echo off
cd /d "d:\Projects\AIEcom\aiecom"
set MONGODB_URI=mongodb+srv://sarveshp273:9Tl78XYbdgdWO2MR@cluster0.hgokx5p.mongodb.net/aiecom?retryWrites=true^&w=majority^&appName=Cluster0
npx tsx scripts/seed.ts
pause
