package handler

import (
	"net/http"
)

func ServerHealth(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Server is healthy"))
}