# wsCommands 2 Server

## WebSocket server for [wsCommands plugin](https://github.com/locvtvs/wsCommands-opk) (OpenKore).

> Compatible with plugin version 2.x

---

### Installation

##### Within the projet root directory, install all dependencies via npm:
```console
npm i
```

##### Start the server using:
```console
npm run start
```

---
### Configuring (.env file)

##### You can change the WebSocket server port with `WS_PORT` variable:
> Remember to change it in the OpenKore config.txt file.
```text
WS_PORT=3000
```

##### Enable or disable log files with `LOG_FILES_ENABLED` variable:
```text
LOG_FILES_ENABLED=<true|false>
```
##### or 
```text
LOG_FILES_ENABLED=<1|0>
```

##### You can change the sender ID of the serverwith `WS_ID` variable:
> Everything sent by the server will carry it.
> Do NOT use spaces or quotation marks for *sender_id*.
```text
WS_ID=<sender_id>
```

---

### Server commands:

> Do NOT use spaces or quotation marks for *client_id* or *group_id*.
> Note: "group" here is NOT about in-game party.

#### Send OpenKore console commands and messages:

##### To a specific client:
```console
sendcmd <client_id> <openkore console command>
```
```console
sendmsg <client_id> <message>
```

##### To all clients connected to the WebSocket server:
```console
sendcmd <-a|--all> <openkore console command>
```
```console
sendmsg <-a|--all> <message>
```

##### To all clients in a specific group:
```console
sendcmd <-g|--group> <group_id> <openkore console command>
```
```console
sendmsg <-g|--group> <group_id> <message>
```

#### Close the entire application:
```console
exit
```
