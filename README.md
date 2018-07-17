# UK Rail Provider

API that provides signed UK rail journeys and fares that can be purchased using the [Planar Network ticket wallet](https://github.com/planarnetwork/ticket-wallet) contract.

## Usage

```
npm start

# Get journeys
curl http://localhost:8002/jp?origin=PDW\&destination=1072\&outwardDate=2018-06-12\&returnDate=2018-06-13\&railcards=\&standardClass=true\&firstClass=false\&adults=1\&children=0\&singles=true\&returns=true

# Create order with selected fares
curl -d "{"outward":{"journey":"/journey/205:MYB_BSW_C71027"},"fares":{"outwardSingle":"/fare-option/fare/1072-0418-00305-OPS-000-1-PU-198-205"}}" -H "Content-Type: application/json" -X POST http://localhost:8002/order 
```

Extract the order URL, signature, expiry and price from the response JSON then run it through the `TicketWallet.createTicket` function using web3.

## License

GPL v3.0