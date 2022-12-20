package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	port, err := getPort()
	if err != nil {
		log.Fatal(err)
	}
	name, err := requiredEnv("NAME")
	if err != nil {
		log.Fatal(err)
	}

	handler := newHandler(name)

	// Echo instance
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	e.GET("/healthz", handler.healthz)

	e.POST("/try", handler.try)
	e.POST("/confirm", handler.confirm)
	e.POST("/cancel", handler.cancel)

	// Start server
	e.Logger.Fatal(e.Start(fmt.Sprintf(":%d", port)))
}

type handler struct {
	name string
}

func newHandler(name string) *handler {
	return &handler{name}
}

func (h *handler) healthz(ectx echo.Context) error {
	return ectx.String(http.StatusOK, "OK")
}

func (h *handler) try(ectx echo.Context) error {
	return ectx.String(http.StatusOK, "try")
}

func (h *handler) confirm(ectx echo.Context) error {
	return ectx.String(http.StatusOK, "try")
}

func (h *handler) cancel(ectx echo.Context) error {
	return ectx.String(http.StatusOK, "try")
}

func requiredEnv(name string) (string, error) {
	val := os.Getenv(name)
	if val == "" {
		return "", fmt.Errorf("env var %s is not defined", name)
	}
	return val, nil
}

func getPort() (int, error) {
	portStr, err := requiredEnv("PORT")
	if err != nil {
		return 0, err
	}
	port, err := strconv.Atoi(portStr)
	if err != nil {
		return 0, fmt.Errorf("failed to parse PORT env var as int; %s; %w", portStr, err)
	}
	return port, nil
}
