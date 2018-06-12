# UK Rail Provider

API that provides signed UK rail journeys and fares.

## TODO

- Add expiry date
- Make fare IDs more unique (date from, query date etc)
- Persistent storage 
- Actual signature
- GET /fare-option handler

## Usage

```
npm start
curl http://localhost:7001/jp?origin=PDW\&destination=1072\&outwardDate=2018-06-12\&returnDate=2018-06-13\&railcards=\&standardClass=true\&firstClass=false\&adults=1\&children=0\&singles=true\&returns=true
```

## License

GPL v3.0