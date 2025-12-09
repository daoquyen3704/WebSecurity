import classNames from "classnames/bind";
import styles from "./DetailPost.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhoneAlt,
  faShareAlt,
  faFlag,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart } from "@fortawesome/free-regular-svg-icons";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import userDefault from "../../assets/images/user-default.svg";

import dayjs from "dayjs";

import {
  requestCreateFavourite,
  requestDeleteFavourite,
  requestGetPostById,
  requestGetPostVip,
} from "../../config/request";
import { useStore } from "../../hooks/useStore";
import { useSocket } from "../../hooks/useSocket";
import Messager from "../../utils/Messager/Messager";
import ChatButton from "../../utils/ChatButton/ChatButton";
import { message } from "antd";

const cx = classNames.bind(styles);

function DetailPost() {
  const [selectedImg, setSelectedImg] = useState("");

  const [user, setUser] = useState({});

  const [post, setPost] = useState({});

  const { id } = useParams();

  const [userHeart, setUserHeart] = useState([]);

  const [postVip, setPostVip] = useState([]);

  const [openShare, setOpenShare] = useState(false);

  const fetchPost = async () => {
    const res = await requestGetPostById(id);
    setPost(res.metadata.data);
    setSelectedImg(res?.metadata?.data?.images[0]);
    setUser(res?.metadata?.dataUser);
    setUserHeart(res?.metadata?.userFavourite);
    document.title = `${res.metadata.data.title} - PhongTro123`;
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  useEffect(() => {
    const fetchPostVip = async () => {
      const res = await requestGetPostVip();
      setPostVip(res.metadata);
    };
    fetchPostVip();
  }, []);

  const { dataUser, setDataMessages } = useStore();
  const { usersMessage, setUsersMessage } = useSocket();

  const handleCreateFavourite = async () => {
    try {
      const data = {
        postId: post._id,
      };
      const res = await requestCreateFavourite(data);
      fetchPost();
      message.success(res.message);
    } catch (error) {
      message.error(error.response.data.message);
    }
  };

  const handleDeleteFavourite = async () => {
    try {
      const data = {
        postId: post._id,
      };
      const res = await requestDeleteFavourite(data);
      fetchPost();
      message.error(res.message);
    } catch (error) {
      message.error(error.response.data.message);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      message.success("Đã sao chép link bài viết!");
    } catch (err) {
      message.error("Không thể sao chép link!");
    }
  };

  return (
    <>
      {/* Popup chia sẻ */}
      {openShare && (
        <div className={cx("share-overlay")}>
          <div className={cx("share-box")}>
            <h3>Chia sẻ bài viết</h3>

            <button className={cx("share-item")} onClick={handleCopyLink}>
              📋 Sao chép link
            </button>

            <a
              className={cx("share-item")}
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                window.location.href
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              👍 Chia sẻ Facebook
            </a>

            <a
              className={cx("share-item")}
              href={`https://zalo.me/share?url=${encodeURIComponent(
                window.location.href
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              💬 Chia sẻ Zalo
            </a>

            <button
              className={cx("close-share")}
              onClick={() => setOpenShare(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Giao diện chính */}
      <div className={cx("wrapper")}>
        <main className={cx("container")}>
          <div className={cx("content")}>
            <div className={cx("left")}>
              <div className={cx("slider-container")}>
                <div className={cx("slide-item")}>
                  <img src={selectedImg} alt="" />
                </div>
                <div className={cx("select-img")}>
                  {post?.images?.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt=""
                      onClick={() => setSelectedImg(image)}
                    />
                  ))}
                </div>
              </div>

              <div className={cx("property-details")}>
                <div className={cx("property-header")}>
                  {post?.typeNews === "vip" && (
                    <span className={cx("vip-tag")}>TIN VIP NỔI BẬT</span>
                  )}
                  <h1 className={cx("property-title")}> {post?.title}</h1>
                  <div className={cx("property-location")}>
                    <span>{post?.location}</span>
                  </div>
                  <div className={cx("property-meta")}>
                    <div className={cx("price")}>
                      {post?.price?.toLocaleString()} VNĐ/tháng
                    </div>
                    <div className={cx("area")}>{post?.area} m²</div>
                  </div>
                </div>

                <div className={cx("property-description")}>
                  <h2>Thông tin mô tả</h2>
                  <p dangerouslySetInnerHTML={{ __html: post?.description }} />
                </div>

                <div className={cx("property-features")}>
                  <h2>Nổi bật</h2>
                  <div className={cx("features-grid")}>
                    {post?.options?.map((option, index) => (
                      <div className={cx("feature-item")} key={index}>
                        <span
                          className={cx("feature-icon", "check")}
                        ></span>
                        <span>{option}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={cx("map-section")}>
                <h3 className={cx("section-title")}>Vị trí & bản đồ</h3>
                <div className={cx("map-container")}>
                  <div className={cx("address-bar")}>
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className={cx("location-icon")}
                    />
                    <span className={cx("address-text")}>{post?.location}</span>
                  </div>
                  <div className={cx("map-frame")}>
                    <iframe
                      src={`https://www.google.com/maps?q=${post?.location}&output=embed`}
                      width="600"
                      height="450"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Property Location"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={cx("right")}>
              <div className={cx("contact-card")}>
                <div className={cx("user-info")}>
                  <div className={cx("avatar")}>
                    <img src={user?.avatar || userDefault} alt="Avatar" />
                  </div>
                  <div className={cx("user-details")}>
                    <h3 className={cx("user-name")}>
                      {user?.username || user?.fullName}
                    </h3>
                    <div className={cx("user-status")}>
                      <span className={cx("status-dot")}></span>
                      <span className={cx("status-text")}>
                        {user?.status || "Đang hoạt động"}
                      </span>
                    </div>
                    <div className={cx("user-stats")}>
                      <span>{user?.lengthPost} tin đăng</span>
                      <span className={cx("dot-separator")}></span>
                      <span>
                        Tham gia từ:{" "}
                        {dayjs(user?.createdAt).format("DD/MM/YYYY")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={cx("contact-buttons")}>
                  <a
                    href={`tel:${user?.phone}`}
                    className={cx("btn", "btn-phone")}
                  >
                    <FontAwesomeIcon icon={faPhoneAlt} />
                    {user?.phone || "chưa cập nhật"}
                  </a>
                  <ChatButton
                    userId={user._id}
                    username={user.username || user.fullName}
                    avatar={user.avatar}
                    status={user.status}
                    className={cx("btn", "btn-zalo")}
                    icon={false}
                  />
                </div>

                <div className={cx("action-buttons")}>
                  <button
                    onClick={
                      userHeart.find((item) => item === dataUser._id)
                        ? handleDeleteFavourite
                        : handleCreateFavourite
                    }
                    className={cx("action-btn")}
                  >
                    <FontAwesomeIcon icon={faHeart} />
                    {userHeart.find((item) => item === dataUser._id)
                      ? "Đã lưu"
                      : "Lưu tin"}
                  </button>

                  {/* Nút mở chia sẻ */}
                  <button
                    className={cx("action-btn")}
                    onClick={() => setOpenShare(true)}
                  >
                    <FontAwesomeIcon icon={faShareAlt} />
                    Chia sẻ
                  </button>
                </div>
              </div>

              <div className={cx("featured-listings")}>
                <h3 className={cx("featured-title")}>Tin đăng nổi bật</h3>
                {postVip.map((item, index) => (
                  <div className={cx("listing-item")} key={index}>
                    <div className={cx("listing-image")}>
                      <img src={item.images[0]} alt="Phòng trọ cao cấp" />
                    </div>
                    <div className={cx("listing-content")}>
                      <h4 className={cx("listing-name")}>{item.title}</h4>
                      <div className={cx("listing-price")}>
                        {item.price.toLocaleString()} VNĐ/tháng
                      </div>
                      <div className={cx("listing-time")}>
                        {dayjs(item.createdAt).format("DD/MM/YYYY")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default DetailPost;
