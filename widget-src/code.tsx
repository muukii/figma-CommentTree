import { HStack, VStack } from "./components";

const { widget } = figma;

const { useSyncedMap, Frame, Text, Input, Image, useEffect } = widget;

import Color from "color";
import dateFormat, { masks } from "dateformat";

type NodeUser = {
  id: string;
  name: string;
  photoUrl: string | null;
};

type Node = {
  userID: string;
  id: string;
  updatedAt: number;
  text: string;
  replies: string[]; // ID
};

const blackTextColor = Color("#2b2b2b");
const whiteTextColor = Color("#fff");
const figmaUser = figma.currentUser!;

type Environment = {
  keyColor: Color;
  textColor: Color;
};

function getTimestamp() {
  // get unix timestamp
  const timestamp = Math.floor(Date.now());
  return timestamp;
}

const user: NodeUser = {
  id: figmaUser.id ?? "unknown",
  name: figmaUser.name,
  photoUrl: figmaUser.photoUrl,
};

function UserIndicator(props: { user: NodeUser; environment: Environment }) {
  return (
    <HStack verticalAlignItems="center" spacing={8}>
      <Image
        cornerRadius={100}
        // Pass a data uri directly as the image
        src={props.user.photoUrl ?? ""}
        width={24}
        height={24}
      />
      <Text
        fill={props.environment.textColor.hexa()}
        fontSize={12}
        fontWeight={"medium"}
      >
        {props.user.name ?? "Unknown user"}
      </Text>
    </HStack>
  );
}

function View(props: {
  env: Environment;
  node: Node;
  nodes: SyncedMap<Node>;
  users: SyncedMap<NodeUser>;
}) {
  const replies = props.node.replies
    .map((id) => props.nodes.get(id))
    .filter((node) => node !== undefined)
    .sort((a, b) => (a!.updatedAt < b!.updatedAt ? -1 : 1)) as Node[];

  return (
    <VStack spacing={8} fill={props.env.keyColor.hex()} padding={24}>
      <HStack spacing={8} verticalAlignItems="center">
        <UserIndicator user={user} environment={props.env} />
        <Text fill={props.env.textColor.alpha(0.5).hexa()} fontSize={12}>
          {dateFormat(new Date(props.node.updatedAt), "default")}
        </Text>
      </HStack>
      <HStack padding={{ left: 32 }}>
        <Input
          placeholder="Enter comment"
          value={props.node.text}
          fontSize={15}
          fill={props.env.textColor.alpha(0.8).hexa()}
          onTextEditEnd={(e) => {
            props.nodes.set("root", {
              userID: user.id,
              id: "root",
              text: e.characters,
              updatedAt: getTimestamp(),
              replies: [],
            });
          }}
        />
      </HStack>

      {/* replies */}
      {replies.map((reply) => {
        return (
          <VStack spacing={8} padding={{ left: 48, top: 8, bottom: 8 }}>
            <HStack spacing={8} verticalAlignItems="center">
              <UserIndicator
                user={props.users.get(reply.userID)!}
                environment={props.env}
              />
              <Text fill={props.env.textColor.alpha(0.5).hexa()} fontSize={12}>
                {dateFormat(new Date(props.node.updatedAt), "default")}
              </Text>
            </HStack>
            <HStack padding={{ left: 32 }}>
              <Input
                placeholder="Enter comment"
                value={reply.text}
                fontSize={15}
                fill={props.env.textColor.alpha(0.8).hexa()}
                onTextEditEnd={(e) => {
                  // reply.set("root", {
                  //   id: "root",
                  //   text: e.characters,
                  //   updatedAt: getTimestamp(),
                  //   replies: [],
                  // });
                }}
              />
            </HStack>
          </VStack>
        );
      })}

      {/* make a reply */}
      <HStack padding={{ left: 64 }}>
        <Input
          placeholder="Reply"
          value={""}
          fontSize={15}
          fill={props.env.textColor.hexa()}
          onTextEditEnd={(e) => {
            if (e.characters === "") return;

            const id = getTimestamp().toString();
            props.nodes.set(props.node.id, {
              ...props.node,
              replies: [...props.node.replies, id],
            });
            props.nodes.set(id, {
              userID: user.id,
              id: id,
              text: e.characters,
              updatedAt: getTimestamp(),
              replies: [],
            });
          }}
        />
      </HStack>
    </VStack>
  );
}

function Widget() {
  const orange = Color("#f94b00");
  const purple = Color("#461a9c");
  const keyColor = purple;
  const textColor =
    keyColor.contrast(whiteTextColor) > keyColor.contrast(blackTextColor)
      ? whiteTextColor
      : blackTextColor;

  const env: Environment = { keyColor, textColor };

  const nodes = useSyncedMap<Node>("node");
  const users = useSyncedMap<NodeUser>("user");
  const node = nodes.get("root");

  useEffect(() => {
    const node = nodes.get("root");
    if (node === undefined) {
      users.set(user.id, user);
      const node = {
        userID: user.id,
        id: "root",
        text: "",
        updatedAt: getTimestamp(),
        replies: [],
      };

      nodes.set(node.id, node);
    }
  });

  if (node === undefined) {
    return <VStack></VStack>;
  } else {
    // Basic usage
    console.log(node.updatedAt, new Date(node.updatedAt).toUTCString());
    return View({ env, node, nodes, users });
  }
}

widget.register(Widget);