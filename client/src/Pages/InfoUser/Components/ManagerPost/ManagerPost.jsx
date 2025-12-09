import React, { useEffect, useState } from "react";
import { Table, Button, Tag, Space, message } from "antd";
import classNames from "classnames/bind";
import styles from "./ManagerPost.module.scss";
import { useNavigate } from "react-router-dom";

import {
  requestGetPostByUserId,
  requestExtendPost,
  requestDeletePostUser,
} from "../../../../config/request";

const cx = classNames.bind(styles);

function ManagerPost() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await requestGetPostByUserId();
      setPosts(res.metadata || []);
    } catch (error) {
      console.log(error);
      message.error("Lỗi tải bài viết!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Extend post by 7 days
  const handleExtend = async (id) => {
    try {
      await requestExtendPost({ id, days: 7 });
      message.success("Gia hạn 7 ngày thành công!");
      fetchPosts();
    } catch {
      message.error("Gia hạn thất bại!");
    }
  };

  // Delete post
  const handleDelete = async (id) => {
    try {
      await requestDeletePostUser({ id });
      message.success("Xoá bài viết thành công!");
      fetchPosts();
    } catch {
      message.error("Xoá thất bại!");
    }
  };

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (v) => `${Number(v).toLocaleString("vi-VN")} đ`,
    },
    {
      title: "Loại tin",
      dataIndex: "typeNews",
      key: "typeNews",
      render: (v) => <Tag color={v === "vip" ? "gold" : "blue"}>{v}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "orange"}>
          {status === "active" ? "Đã duyệt" : "Chờ duyệt"}
        </Tag>
      ),
    },
    {
      title: "Ngày hết hạn",
      dataIndex: "endDate",
      key: "endDate",
      render: (d) =>
        d ? new Date(d).toLocaleDateString("vi-VN") : <i>Chưa có</i>,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() =>
              navigate(`/trang-ca-nhan/sua-bai-viet/${record._id}`)
            }
          >
            Sửa
          </Button>

          <Button type="link" onClick={() => handleExtend(record._id)}>
            Gia hạn +7 ngày
          </Button>

          <Button type="link" danger onClick={() => handleDelete(record._id)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className={cx("wrapper")}>
      <div className={cx("panel")}>
        <div className={cx("header")}>
          <Button
            type="primary"
            onClick={() => navigate("/trang-ca-nhan/them-bai-viet")}
          >
            + Thêm bài viết mới
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={posts}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 5 }}
          scroll={{ x: "max-content" }}
          className={cx("table")}
        />
      </div>
    </div>
  );
}

export default ManagerPost;
