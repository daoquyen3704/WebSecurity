import classNames from "classnames/bind";
import styles from "./HomePage.module.scss";

import CardBody from "../CardBody/CardBody";
import { useState, useEffect, useMemo } from "react";
import { requestGetPosts, requestPostSuggest } from "../../config/request";

import dayjs from "dayjs";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { requestTopUsersWeek } from "../../config/request";

const sortPosts = (posts) => {
  const now = new Date();

  return posts.sort((a, b) => {
    const aVip = a.typeNews === "vip";
    const bVip = b.typeNews === "vip";

    const aExpire = new Date(a.expireAt) > now;
    const bExpire = new Date(b.expireAt) > now;

    // VIP còn hạn → ưu tiên nhất
    if (aVip && aExpire && !(bVip && bExpire)) return -1;
    if (bVip && bExpire && !(aVip && aExpire)) return 1;

    // Tin thường còn hạn → ưu tiên kế
    if (!aVip && aExpire && !(bExpire && !bVip)) return -1;
    if (!bVip && bExpire && !(aExpire && !aVip)) return 1;

    // Tin hết hạn → cuối
    if (aExpire && !bExpire) return -1;
    if (!aExpire && bExpire) return 1;

    // Sắp theo ngày tạo
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
};

const cx = classNames.bind(styles);

function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = "Trang chủ";
  }, []);

  // Helpers
  const getQueryParam = (param) =>
    new URLSearchParams(location.search).get(param);
  const setQueryParams = (params) => {
    const query = new URLSearchParams(location.search);
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") query.delete(k);
      else query.set(k, v);
    });
    const queryString = query.toString();
    navigate(
      queryString ? `${location.pathname}?${queryString}` : location.pathname,
      { replace: true }
    );
  };

  // State khởi tạo từ URL
  const [category, setCategory] = useState(
    () => getQueryParam("category") || ""
  );
  const [priceRange, setPriceRange] = useState(
    () => getQueryParam("priceRange") || ""
  );
  const [areaRange, setAreaRange] = useState(
    () => getQueryParam("areaRange") || ""
  );
  const [province, setProvince] = useState(
    () => getQueryParam("province") || ""
  );
  const [typeNews, setTypeNews] = useState(
    () => getQueryParam("typeNews") || "vip"
  );
  const [topUsers, setTopUsers] = useState([]);

  const [dataPost, setDataPost] = useState([]);
  const [validPosts, setValidPosts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const latestThreePosts = useMemo(() => validPosts.slice(0, 3), [validPosts]);

  // const [dataNewPost, setDataNewPost] = useState([]);
  const [dataPostSuggest, setDataPostSuggest] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch danh sách theo filter
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const params = { category, priceRange, areaRange, province, typeNews };
      try {
        const res = await requestGetPosts(params);
        setTotalCount(res?.total || 0);

        let cleaned = (res?.metadata || []).filter(
          (item) => new Date(item.expireAt || item.endDate) > new Date()
        );
        cleaned = sortPosts(cleaned);

        setDataPost(res?.metadata || []); // Keep original if needed for other things, or just for reference
        setValidPosts(cleaned);
      } finally {
        setLoading(false);
      }
      setQueryParams(params);
      setCurrentPage(1);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, priceRange, areaRange, province, typeNews]);

  useEffect(() => {
    const fetchTopUsers = async () => {
      const res = await requestTopUsersWeek();
      setTopUsers(res?.metadata || []);
    };
    fetchTopUsers();
  }, []);

  // Tin mới & gợi ý
  // useEffect(() => {
  //   const fetchSide = async () => {
  //     const res = await requestGetNewPost();
  //     const resSuggest = await requestPostSuggest();
  //     setDataNewPost((res?.metadata || []).slice(0, 3));
  //     setDataPostSuggest(resSuggest?.metadata || []);
  //   };
  //   fetchSide();
  // }, []);

  const totalPosts = useMemo(() => dataPost?.length || 0, [dataPost]);

  const resetAll = () => {
    setCategory("");
    setPriceRange("");
    setAreaRange("");
    setProvince("");
    setTypeNews("vip");
  };

  const provincesQuick = [
    "Hồ Chí Minh",
    "Hà Nội",
    "Đà Nẵng",
    "Bình Dương",
    "Đồng Nai",
    "Cần Thơ",
  ];

  return (
    <div className={cx("wrapper")}>
      <div className={cx("main")}>
        {/* HERO FILTER */}
        <div className={cx("hero")}>
          <div className={cx("hero__heading")}>
            <h1 className={cx("title")}>Tìm kiếm chỗ thuê giá tốt</h1>
            <p className={cx("subtitle")}>
              Công cụ tìm kiếm phòng trọ, nhà nguyên căn, căn hộ cho thuê, tìm
              người ở ghép nhanh chóng, hiệu quả!
            </p>
            <p className={cx("total")}>
              Hiện có <strong>{totalCount}</strong> tin đang cho thuê
            </p>
          </div>

          {/* Tabs danh mục chính */}
          <div className={cx("tabs")}>
            {[
              { value: "", label: "Tất cả" },
              { value: "phong-tro", label: "Phòng trọ" },
              { value: "can-ho-chung-cu", label: "Căn hộ" },
              { value: "nha-nguyen-can", label: "Nhà ở" },
              { value: "o-ghep", label: "Ở ghép" },
              { value: "can-ho-mini", label: "Căn hộ mini" },
            ].map((t) => (
              <button
                key={t.value || "all"}
                className={cx("tab", { active: category === t.value })}
                onClick={() => setCategory(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Filter nhanh: GIỮ giá/diện tích/loại tin, XÓA khu vực (theo yêu cầu) */}
          <div className={cx("quickFilters")}>
            <div className={cx("filterRow")}>
              <div className={cx("selectGroup")}>
                <label>Khoảng giá</label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="duoi-1-trieu">Dưới 1 triệu</option>
                  <option value="tu-1-2-trieu">1 - 2 triệu</option>
                  <option value="tu-2-3-trieu">2 - 3 triệu</option>
                  <option value="tu-3-5-trieu">3 - 5 triệu</option>
                  <option value="tu-5-7-trieu">5 - 7 triệu</option>
                  <option value="tu-7-10-trieu">7 - 10 triệu</option>
                  <option value="tu-10-15-trieu">10 - 15 triệu</option>
                  <option value="tren-15-trieu">Trên 15 triệu</option>
                </select>
              </div>

              <div className={cx("selectGroup")}>
                <label>Diện tích</label>
                <select
                  value={areaRange}
                  onChange={(e) => setAreaRange(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="duoi-20">Dưới 20 m²</option>
                  <option value="tu-20-30">20 - 30 m²</option>
                  <option value="tu-30-50">30 - 50 m²</option>
                  <option value="tu-50-70">50 - 70 m²</option>
                  <option value="tu-70-90">70 - 90 m²</option>
                  <option value="tren-90">Trên 90 m²</option>
                </select>
              </div>

              <button className={cx("resetBtn")} onClick={resetAll}>
                Đặt lại
              </button>
            </div>
          </div>
        </div>

        {/* DANH SÁCH TIN CHÍNH */}
        <div className={cx("contentCard")}>
          <div className={cx("contentCard__head")}>
            <h2>Tin nổi bật</h2>
          </div>
          {loading ? (
            <div className={cx("skeletonGrid")}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={cx("skeletonItem")} />
              ))}
            </div>
          ) : (
            <>
              <div className={cx("grid")}>
                {validPosts
                  .slice((currentPage - 1) * 9, currentPage * 9)
                  .map((post, idx) => (
                    <Link
                      key={post._id || post.key || idx}
                      to={`/chi-tiet-tin-dang/${post._id || post.key || idx}`}
                      className={cx("cardLink")}
                    >
                      <CardBody post={post} />
                    </Link>
                  ))}
                {(!validPosts || validPosts.length === 0) && (
                  <div className={cx("empty")}>
                    Không tìm thấy tin phù hợp. Hãy thử thay đổi tiêu chí lọc.
                  </div>
                )}
              </div>

              {/* PAGINATION */}
              {validPosts.length > 9 && (
                <div className={cx("pagination")}>
                  {Array.from({ length: Math.ceil(validPosts.length / 9) }).map(
                    (_, i) => (
                      <button
                        key={i}
                        className={cx("pageBtn", {
                          active: currentPage === i + 1,
                        })}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    )
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* SIDEBAR */}
      <aside className={cx("sidebar")}>
        <div className={cx("sideSection")}>
          <h3>Tin mới đăng</h3>

          <div className={cx("newPosts")}>
            {latestThreePosts.map((item, idx) => (
              <Link
                to={`/chi-tiet-tin-dang/${item._id || item.key || idx}`}
                key={item._id || item.key || idx}
              >
                <div className={cx("postItem")}>
                  <div className={cx("thumb")}>
                    <img src={item.images?.[0]} alt={item.title} />
                  </div>

                  <div className={cx("info")}>
                    <h4 className={cx("name")}>{item.title}</h4>
                    <div className={cx("meta")}>
                      <span className={cx("price")}>
                        {Number(item.price || 0).toLocaleString("vi-VN")} VNĐ
                      </span>
                      <span className={cx("time")}>
                        {dayjs(item.createdAt).format("DD/MM/YYYY")}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        {/* TOP USERS – người đăng nhiều nhất tuần */}
        {topUsers.length > 0 && (
          <div className={cx("sideSection")}>
            <h3>Top người đăng bài</h3>

            <div className={cx("newPosts")}>
              {topUsers.map((u, idx) => (
                <div key={u._id} className={cx("postItem")}>
                  <div className={cx("thumb")}>
                    <img src={u.avatar || "/default-avatar.png"} alt={u.name} />
                    <span className={cx("badge")}>#{idx + 1}</span>
                  </div>

                  <div className={cx("info")}>
                    <h4 className={cx("name")}>{u.name}</h4>
                    <div className={cx("meta")}>
                      <span className={cx("price")}>{u.count} bài đăng</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

export default HomePage;
