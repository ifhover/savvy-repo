"use client";

import { Typography } from "antd";
import { userGetMyDetail } from "@/api/user.api";
import { useQuery } from "@/hooks/flowQuery";

const { Title, Paragraph } = Typography;

export default function Panel() {
  const { data: userInfo, loading } = useQuery(userGetMyDetail);

  return <div>Hello world</div>;
}
