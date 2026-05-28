import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import bgImage from "../../../src/assets/images/background.jpg";
import bgLogo from "../../../src/assets/images/PNG-V2-111.png";
import LoadingBox from '../../assets/components/Loading';

export default function Login() {
    // note to unlocked this const make sure you uncomment the {token} register a new account
    // const {token, setToken} = useContext(AppContext) 
    const { setToken } = useContext(AppContext)
    const navigate = useNavigate()

    const [showLoading, setShowLoading] = useState(false);
    const isLoading = () => {setShowLoading(true)};
    const stopLoading = () => {setShowLoading(false)};


    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({});

    async function handleLogin(e) {
        e.preventDefault();
        isLoading();

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify(formData),
            });

            let data = null;
            try {
                data = await res.json();
            } catch {
                console.error("Invalid JSON response from backend");
                setErrors({ general: ["Server returned invalid response"] });
                return;
            }

            if (data?.errors) {
                setErrors(data.errors);
            } else if (data?.token) {
                localStorage.setItem("token", data.token);
                setToken(data.token);
                navigate("/dashboard");
            } else {
                console.error("Unexpected response structure", data);
                setErrors({ general: ["Unexpected response from server"] });
            }

        } catch (err) {
            console.error("Network or fetch error", err);
            setErrors({ general: ["Network error. Please try again."] });
        } finally {
            stopLoading();
        }
    }


    return (
        <>
            {/* <div className="bg-center bg-cover bg-no-repeat h-[100vh] w-screen relative flex items-center"
                    style={{ backgroundImage: `url(${bgImage})` }} > */}
            <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
                <form
                    onSubmit={handleLogin}
                    className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 w-full max-w-md space-y-6"
                >
                    {/* Logo */}
                    <div className="flex justify-center">
                    <img src={bgLogo} alt="Logo" className="w-24 sm:w-32 h-auto rounded-lg" />
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800">
                    Sign in to your account
                    </h2>

                    {/* Email */}
                    <div>
                    <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        htmlFor="email"
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                                focus:outline-none focus:ring-2 focus:ring-teal-500 
                                text-sm sm:text-base"
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    {errors.email && (
                        <p className="text-sm text-red-500 mt-1">{errors.email[0]}</p>
                    )}
                    </div>

                    {/* Password */}
                    <div>
                    <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        htmlFor="password"
                    >
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                                focus:outline-none focus:ring-2 focus:ring-teal-500 
                                text-sm sm:text-base"
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    {errors.password && (
                        <p className="text-sm text-red-500 mt-1">{errors.password[0]}</p>
                    )}
                    </div>

                    {/* Button */}
                    <button
                    type="submit"
                    className="w-full bg-teal-500 text-white py-2.5 rounded-lg 
                                hover:bg-teal-600 active:bg-teal-700 transition duration-200 
                                text-sm sm:text-base font-medium"
                    >
                    Sign In
                    </button>

                    {/* Extra options */}
                    {/* <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-gray-600 mt-2">
                    <a href="#" className="hover:underline mb-2 sm:mb-0">
                        Forgot password?
                    </a>
                    <a href="#" className="hover:underline">
                        Create an account
                    </a>
                    </div> */}
                </form>
            </div>






            <LoadingBox open={showLoading} onClose={stopLoading} setOpen={stopLoading} />
        </>
    )
}