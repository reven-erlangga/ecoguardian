FROM python:3.12-slim

WORKDIR /app

COPY backend/classification-service/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt && rm -rf /root/.cache/pip

# Generate gRPC/Proto stubs at build time (build context = repo root,
# so protobuf/ is available). protogen/ is gitignored, hence generated here.
COPY protobuf /app/protobuf
COPY backend/classification-service /app/service
WORKDIR /app/service
RUN python -c "\
import grpc_tools.protoc as p; \
p.main(['grpc_tools.protoc','-I/app/protobuf','--python_out=protogen',\
'--grpc_python_out=protogen','classification/classification.proto',\
'classification/service.proto'])" \
&& mkdir -p models \
&& cp features/classifier/labels.json models/labels.json

WORKDIR /app
RUN cp -r /app/service/* /app/ && rm -rf /app/protobuf /app/service

EXPOSE 8083 50053

CMD ["python", "server.py"]
