package main

import (
    "fmt"
    "net"
    "os"
    "time"
)

func main() {
    // Create a UDP listener on port 3478.
    listener, err := net.ListenUDP("udp", &net.UDPAddr{Port: 3478})
    if err != nil {
        fmt.Println(err)
        os.Exit(1)
    }

    // Start a loop to listen for incoming TURN requests.
    for {
        // Read the next request from the listener.
        buf := make([]byte, 1024)
        n, _, err := listener.ReadFromUDP(buf)
        if err != nil {
            fmt.Println(err)
            continue
        }

        // Parse the request.
        request := string(buf[:n])
        fmt.Println("Received TURN request:", request)

        // Generate a response.
        response := fmt.Sprintf("TURN %s:%d", request, time.Now().Unix())

        // Send the response back to the client.
        listener.WriteToUDP([]byte(response), &net.UDPAddr{IP: net.ParseIP(listener.RemoteAddr().String()), Port: 3478})
    }
}
