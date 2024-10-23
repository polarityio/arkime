# Polarity - Arkime Integration

Arkime is an open-source, large scale, full packet capturing, indexing, and database system. The Polarity Arkime integration supports searching Arkime sessions for IPs, domains, and URLs. 

To learn more about Arkime, visit the [official website](https://arkime.com/).

## Integration Options

### Arkime Server URL

URL for your Arkime Server to include schema (https://) and port if necessary

### Arkime Username
Username of the Arkime user account to authenticate with. The account should have "Header Auth Enabled" and does not need "Web Enabled" access.  The account only needs the "Arkime User" role.  

### Arkime Password
Password for the provided Arkime Username

### Arkime IP Expression
The Arkime expression to use when running searches on IP addresses. The string `{{ENTITY}}` will be replaced by the looked up IP address. If left blank, no IP searches will be run.

### Arkime Domain Expression
The Arkime expression to use when running searches on Domains. The string `{{ENTITY}}` will be replaced by the looked up domain. If left blank, no domain searches will be run.

### Arkime URL Expression
The Arkime expression to use  when running searches on URLs. The string `{{ENTITY}}` will be replaced by the looked up URL. If left blank, no URL searches will be run.

### Hours Back to Search
The number of hours back to search. Defaults to 1 (i.e., search the last hour of data). If set to -1, all data will be searched. The user used to authenticate to Arkime must have a "Query Time Limit" greater or equal to this setting.

### Session Summary Fields
Comma delimited list of session database fields to display in the summary section of the details block. Fields not listed will be viewable when the user clicks to view additional details. The default fields are:
```
firstPacket, lastPacket, ipProtocol, source.ip, source.port, destination.ip, destination.port, network.packets, network.bytes, node
```

## Installation Instructions

Installation instructions for integrations are provided on the [PolarityIO GitHub Page](https://polarityio.github.io/).

## Polarity

Polarity is a memory-augmentation platform that improves and accelerates analyst decision making. For more information about the Polarity platform please see:

https://polarity.io/
