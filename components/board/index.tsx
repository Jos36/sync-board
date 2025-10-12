"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { createClient } from "@/lib/supabase/client";
// import { EllipsisVertical, Save } from "lucide-react";
import BoardSidebar from "./BoardSidebar";

const initialNodes = [
  {
    id: "n1",
    position: { x: 0, y: 0 },
    data: { label: "Node 1", draggingUserId: false },
    style: { color: "#000000" },
  },
  {
    id: "n2",
    position: { x: 0, y: 100 },
    data: { label: "Node 2", draggingUserId: false },
    style: { color: "#000000" },
  },
];
const initialEdges = [{ id: "n1-n2", source: "n1", target: "n2" }];

export default function Board() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [presenceState, setPresenceState] = useState({});
  const [userId] = useState(`user_${Math.random().toString(36).substr(2, 9)}`); // Generate a random user ID
  const supabase = createClient();
  const channelRef = useRef(null);
  const EVENT_NAME = "nodes";

  useEffect(() => {
    if (!channelRef.current) {
      channelRef.current = supabase.channel("nodes");

      channelRef.current.subscribe(async (status) => {
        if (status !== "SUBSCRIBED") {
          return;
        }
        console.log("serverResponse", status);
      });

      // Handle presence join event
      // channelRef.current.on(
      //   "presence",
      //   { event: "join" },
      //   ({ key, newPresences }) => {
      //     console.log("User joined:", key, newPresences);
      //     setPresenceState((prev) => ({
      //       ...prev,
      //       [key]: newPresences,
      //     }));
      //   },
      // );
      //
      //
      channelRef.current.on("broadcast", { event: EVENT_NAME }, (payload) => {
        console.log(payload.payload.nodes);
        setNodes(payload.payload.nodes);
      });
    }
    console.log(nodes);

    if (channelRef.current) {
      let isCurrentUserDragging = false;

      nodes.map((node) => {
        if (node.data.draggingUserId == userId) {
          isCurrentUserDragging = true;
        }
      });
      // nodes.filter((node) => node.isdragging !== userId)
      if (isCurrentUserDragging) {
        channelRef.current.send({
          type: "broadcast",
          event: EVENT_NAME,
          payload: { nodes },
        });
      }
    }
  }, [nodes]);

  // Initialize channel and set up presence event listeners
  // useEffect(() => {
  //   // Create channel only once
  //   if (!channelRef.current) {
  //     channelRef.current = supabase.channel("room_01");
  //
  //     // Handle presence join event
  //     channelRef.current.on(
  //       "presence",
  //       { event: "join" },
  //       ({ key, newPresences }) => {
  //         console.log("User joined:", key, newPresences);
  //         setPresenceState((prev) => ({
  //           ...prev,
  //           [key]: newPresences,
  //         }));
  //       },
  //     );
  //
  //     // Handle presence leave event
  //     channelRef.current.on(
  //       "presence",
  //       { event: "leave" },
  //       ({ key, leftPresences }) => {
  //         console.log("User left:", key, leftPresences);
  //         setPresenceState((prev) => {
  //           const newState = { ...prev };
  //           delete newState[key];
  //           return newState;
  //         });
  //       },
  //     );
  //
  //     // Subscribe to the channel
  //     channelRef.current.subscribe(async (status) => {
  //       if (status === "SUBSCRIBED") {
  //         const statusPayload = {
  //           user: userId,
  //           nodes: nodes,
  //           online_at: new Date().toISOString(),
  //         };
  //         await channelRef.current.track(statusPayload).catch((error) => {
  //           console.error("Error tracking initial presence:", error);
  //         });
  //       }
  //     });
  //   }
  //
  //   // Cleanup on component unmount
  //   return () => {
  //     if (channelRef.current) {
  //       channelRef.current.unsubscribe();
  //       channelRef.current = null;
  //     }
  //   };
  // }, [userId]); // Run once on mount or when userId changes
  //
  // useEffect(() => {
  //   if (channelRef.current) {
  //     const statusPayload = {
  //       user: userId,
  //       nodes: nodes,
  //       online_at: new Date().toISOString(),
  //     };
  //     channelRef.current.track(statusPayload).catch((error) => {
  //       console.error("Error tracking presence update:", error);
  //     });
  //   }
  // }, [nodes]);
  //
  const onlineUsers = Object.entries(presenceState).flatMap(
    ([key, presences]) =>
      presences.map((presence) => ({
        key,
        user: presence.user,
        online_at: presence.online_at,
      })),
  );

  const onNodesChange = useCallback((changes) => {
    // console.log(changes);
    // const modifiedChanges = changes.map((change) => {
    //   return {
    //     ...change,
    //     data: { draggingUserId: change.dragging ? userId : false },
    //   };
    // });
    // console.log(applyNodeChanges(modifiedChanges, nodes));
    return setNodes((nodesSnapshot) =>
      applyNodeChanges(changes, nodesSnapshot).map((node) => {
        return {
          ...node,
          data: {
            ...node.data,
            draggingUserId: node.dragging ? userId : false,
          },
        };
      }),
    );
  }, []);
  const onEdgesChange = useCallback(
    (changes) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  return (
    <div className="flex " style={{ width: "100vw", height: "100vh" }}>
      <BoardSidebar />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      />
    </div>
  );
}
