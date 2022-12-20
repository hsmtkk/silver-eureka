FROM golang:1.19 AS builder
WORKDIR /app
COPY go.mod .
COPY go.sum .
RUN go mod download
COPY service/ /app/service/
WORKDIR /app/service
RUN CGO_ENABLED=0 go build -o service

FROM gcr.io/distroless/static-debian11 AS runtime
COPY --from=builder /app/service/service /app/service/service
ENTRYPOINT ["/app/service/service"]
