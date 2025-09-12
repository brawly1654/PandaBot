#Run uvicorn fastapi app:app
#!/bin/bash
source catbox-alter/venv/bin/activate
uvicorn app:app --host 0.0.0.0 --port 8000 --reload --timeout-keep-alive 60 --log-level info --app-dir /data/data/com.termux/files/home/whatsapp-botchill/catbox-alter
