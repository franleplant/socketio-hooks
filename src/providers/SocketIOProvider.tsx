import React, { useState } from "react";
import useDeepCompareEffect from "use-deep-compare-effect";
import io from "socket.io-client";
import SocketIOContext from "../contexts/SocketIOContext";

interface ISockets {
  [key: string]: SocketIOClient.Socket;
}

// TODO since this is a public facing component it should
// expose PropTypes
interface IProps {
  url: string;
  namespaces?: string[];
  connectionOptions?: SocketIOClient.ConnectOpts;
  children: React.ReactNode;
}

export default function SocketProvider(props: IProps): React.ReactNode {
  const { children, namespaces, url, connectionOptions } = props;

  const [sockets, setSockets] = useState<ISockets>({});

  useDeepCompareEffect(() => {
    if (namespaces && namespaces.length > 0) {
      for (const namespace of namespaces) {
        // TODO this seems unnecesary, let the users take care of this
        const connectionUrl = url.endsWith("/")
          ? url + namespace
          : url + `${url}/${namespace}`;
        const socket = io(connectionUrl, connectionOptions);

        setSockets(sockets => ({
          ...sockets,
          [namespace]: socket
        }));
      }
    } else {
      // TODO instead of this simply say that "/" means default
      const socket = io(url, connectionOptions);
      sockets.default = socket;
    }
  }, [url, namespaces, connectionOptions]);

  return (
    <SocketIOContext.Provider value={sockets}>
      {children}
    </SocketIOContext.Provider>
  );
}
