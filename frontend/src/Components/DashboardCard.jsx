import { Typography } from "antd";
import React from "react";
import { Link } from "react-router-dom";
const { Title, Text } = Typography;
function DashboardCard({ stat, index }) {
  return (
    <div className="w-100 flex">
      <Link to={stat.route} className="w-100 flex text-decoration-none">
        <div
          className="p-3 rounded-md w-100 "
          key={index}
          style={{ background: stat.color }}
        >
          <div className="flex gap-2 justify-between">
            <div className="d-flex flex-col">
              <Title level={5}>{stat.fromName}</Title>
              <Title level={4} className="m-0">
                {stat.count}
              </Title>
            </div>
            <div className="d-flex justify-between flex-col">
              <Text style={{ fontSize: "10px" }}>{stat.change}</Text>
              <Text style={{ fontSize: "10px" }}>Pending: {stat.pending}</Text>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default DashboardCard;
