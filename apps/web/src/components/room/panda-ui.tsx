"use client";

import { useState } from "react";
import { Text, RoundedBox } from "@react-three/drei";
import { useChat } from "@ai-sdk/react";

const categories = [
  {
    title: "Work",
    color: "#6366f1",
    options: ["Organize calendar", "Formulate email", "Decline meeting"],
  },
  {
    title: "Social",
    color: "#06b6d4",
    options: ["Plan hangout", "Formulate message", "Check in on friend"],
  },
  {
    title: "Mental health",
    color: "#f59e0b",
    options: ["Rant", "Talk it out", "Breathing exercise"],
  },
  {
    title: "Relax",
    color: "#10b981",
    options: ["Pet an animal", "Watch snow fall", "Float on water"],
  },
  {
    title: "Something",
    color: "#ec4899",
    options: ["Pet an animal", "Watch snow fall", "Float on water"],
  },
];

function Card({
  title,
  color,
  options,
  position,
  onSelect,
}: {
  title: string;
  color: string;
  options: string[];
  position: [number, number, number];
  onSelect: (option: string) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <group position={position}>
      {/* Card background */}
      <RoundedBox args={[0.7, 0.9, 0.02]} radius={0.03} smoothness={4}>
        <meshStandardMaterial color="#1e1e2e" transparent opacity={0.9} />
      </RoundedBox>

      {/* Title */}
      <Text position={[0, 0.32, 0.02]} fontSize={0.07} color={color} anchorX="center" font={undefined}>
        {title}
      </Text>

      {/* Divider */}
      <mesh position={[0, 0.24, 0.02]}>
        <planeGeometry args={[0.55, 0.005]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>

      {/* Options */}
      {options.map((opt, i) => (
        <group key={opt} position={[0, 0.1 - i * 0.2, 0.02]}>
          <RoundedBox
            args={[0.58, 0.14, 0.01]}
            radius={0.02}
            smoothness={4}
            onPointerOver={() => setHovered(i)}
            onPointerOut={() => setHovered(null)}
            onClick={() => onSelect(opt)}
          >
            <meshStandardMaterial
              color={hovered === i ? color : "#2a2a3e"}
              transparent
              opacity={hovered === i ? 0.8 : 0.7}
            />
          </RoundedBox>
          <Text position={[0, 0, 0.02]} fontSize={0.05} color="#e2e8f0" anchorX="center" font={undefined}>
            {opt}
          </Text>
        </group>
      ))}
    </group>
  );
}

function SpeechBubble({ text, position }: { text: string; position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[1.4, 0.3, 0.02]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color="#ffffff" transparent opacity={0.95} />
      </RoundedBox>
      <Text position={[0, 0, 0.02]} fontSize={0.07} color="#1e1e2e" anchorX="center" maxWidth={1.2} font={undefined}>
        {text}
      </Text>
      {/* Triangle pointer */}
      <mesh position={[0, -0.2, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.06, 0.1, 3]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.95} />
      </mesh>
    </group>
  );
}

export function PandaUI({
  pandaPosition = [0, 0, 0] as [number, number, number],
  userId,
  userName,
}: {
  pandaPosition?: [number, number, number];
  userId: string;
  userName: string;
}) {
  const [showCards, setShowCards] = useState(true);

  const { messages, append, isLoading } = useChat({
    api: "/api/room/chat",
    body: { userId },
    initialMessages: [
      {
        id: "greeting",
        role: "assistant",
        content: `Hei ${userName}! I'm panda, come sit down. What can I help you with?`,
        parts: [{ type: "text", text: `Hei ${userName}! I'm panda, come sit down. What can I help you with?` }],
      },
    ],
  });

  const lastAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant");
  const bubbleText = lastAssistantMessage?.content ?? "Hei! I'm panda, I'm here to help you.";

  const handleSelect = (option: string) => {
    append({ role: "user", content: option });
  };

  // Position cards above the table, in front of panda
  const cardBaseY = pandaPosition[1] + 1.8;
  const cardBaseZ = pandaPosition[2] + 2.5;

  return (
    <group>
      {/* Speech bubble above panda */}
      <SpeechBubble
        text={bubbleText}
        position={[pandaPosition[0], pandaPosition[1] + 2.2, pandaPosition[2] + 3.5]}
      />

      {/* "What can I do?" title */}
      {showCards && (
        <>
          <Text
            position={[pandaPosition[0], cardBaseY + 0.7, cardBaseZ]}
            fontSize={0.12}
            color="#e2e8f0"
            anchorX="center"
            font={undefined}
          >
            What can I do?
          </Text>

          {/* Category cards spread over the table */}
          {categories.map((cat, i) => (
            <Card
              key={cat.title}
              title={cat.title}
              color={cat.color}
              options={cat.options}
              position={[
                pandaPosition[0] + (i - 2) * 0.8,
                cardBaseY,
                cardBaseZ,
              ]}
              onSelect={handleSelect}
            />
          ))}
        </>
      )}
    </group>
  );
}
