# Halal Fans remix engine: Genjustsu open-source workflow + headless API (adapter.py).
FROM python:3.12-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends git rubberband-cli ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Pinned upstream (MIT): https://github.com/sirioberati/Genjustsu-Open-Source-Workflow
ARG GENJUTSU_REF=40fd6615c2b7d940d4d7060e82de522292eefe99
RUN git clone https://github.com/sirioberati/Genjustsu-Open-Source-Workflow.git /app/genjutsu \
 && cd /app/genjutsu && git checkout "$GENJUTSU_REF" \
 && rm -rf .git examples static/companions

WORKDIR /app
RUN pip install --no-cache-dir -r /app/genjutsu/requirements.txt
COPY adapter.py /app/adapter.py

ENV GENJUTSU_DIR=/app/genjutsu DATA_DIR=/data PYTHONUNBUFFERED=1
EXPOSE 8080
CMD ["sh", "-c", "uvicorn adapter:app --host 0.0.0.0 --port ${PORT:-8080}"]
