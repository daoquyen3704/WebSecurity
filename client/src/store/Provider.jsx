import Context from "./Context";
import CryptoJS from "crypto-js";
import cookies from "js-cookie";
import { useState, useEffect } from "react";
import { requestAuth, requestSearch } from "../config/request";
import useDebounce from "../hooks/useDebounce";

export function Provider({ children }) {
    const [dataUser, setDataUser] = useState({});
    const [dataPayment, setDataPayment] = useState(null);

    const [dataMessages, setDataMessages] = useState([]);
    const [globalUsersMessage, setGlobalUsersMessage] = useState([]);

    // ================== AUTH ==================
    const fetchAuth = async () => {
        try {
            const res = await requestAuth();
            const bytes = CryptoJS.AES.decrypt(
                res.metadata.auth,
                import.meta.env.VITE_SECRET_CRYPTO
            );
            const originalText = bytes.toString(CryptoJS.enc.Utf8);
            const user = JSON.parse(originalText);
            setDataUser(user);
        } catch (err) {
            console.log("Auth error:", err);
        }
    };

    useEffect(() => {
        const token = cookies.get("logged");
        if (!token) return;
        fetchAuth();
    }, []);

    // ================== SEARCH ==================
    const [valueSearch, setValueSearch] = useState("");
    const debouncedSearch = useDebounce(valueSearch, 400);

    const [dataSearch, setDataSearch] = useState([]);

    useEffect(() => {
        if (!debouncedSearch.trim()) {
            setDataSearch([]);
            return;
        }

        const fetchData = async () => {
            try {
                const res = await requestSearch(debouncedSearch);
                setDataSearch(res?.metadata || []);
            } catch (err) {
                console.log("Search API error:", err);
                setDataSearch([]);
            }
        };

        fetchData();
    }, [debouncedSearch]);

    // ================== RETURN CONTEXT ==================
    return (
        <Context.Provider
            value={{
                dataUser,
                dataPayment,
                setDataPayment,
                fetchAuth,

                valueSearch,
                setValueSearch,
                dataSearch,

                dataMessages,
                setDataMessages,
                globalUsersMessage,
                setGlobalUsersMessage,
            }}
        >
            {children}
        </Context.Provider>
    );
}
