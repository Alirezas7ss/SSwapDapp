export default function handler(req, res) {
  res
    .status(200)
    .json({
      name: "Key Vault",
      privkey:
        "db0fcfa3b9e120ccad13b9b9323bd76224c2b212fbd4b65a1cf1d747a9b693d3",
      apikey: "O71hD9YFD4nxfOWd3NxwXfZ3WMaDDDGAdnuDu3kYGfhgvBwQMPkMP7Ut1wCHPDkp",
    });
    var now = new Date(Date.now())
    process.stdout.write('Key Request Received: ' + now + "\n" )
}