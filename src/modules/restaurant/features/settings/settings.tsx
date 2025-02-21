import { useState } from "react";
import { Sun, Moon, User, Headphones, LogOut } from "lucide-react";
import Input from "@/components/input/input";

const Settings = () => {
    const [theme, setTheme] = useState("light");

    return (
        <div>
            <div className="">
                <div className="mx-auto flex justify-evenly mt-[100px]">
                    <div className="max-h-[300px] min-w-[300px] bg-white rounded-xl p-4">
                        <div className="bg-white p-4 rounded-2xl">
                            {/* Theme Toggle */}
                            <div className="text-sm font-medium text-gray-700 mb-4">
                                Theme
                                <div className="mt-2 flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
                                    <button
                                        className={`flex-1 px-3 py-1 rounded-lg text-sm ${theme === "light" ? "bg-white shadow-md" : "text-gray-500"
                                            }`}
                                        onClick={() => setTheme("light")}
                                    >
                                        <Sun className="inline w-4 h-4 mr-1" /> Light
                                    </button>
                                    <button
                                        className={`flex-1 px-3 py-1 rounded-lg text-sm ${theme === "dark" ? "bg-white shadow-md" : "text-gray-500"
                                            }`}
                                        onClick={() => setTheme("dark")}
                                    >
                                        <Moon className="inline w-4 h-4 mr-1" /> Dark
                                    </button>
                                </div>
                            </div>

                            {/* Menu */}
                            <div className="space-y-2">
                                <button className="flex items-center w-full px-4 py-2 rounded-lg bg-gray-100 text-green-900">
                                    <User className="w-5 h-5 mr-3" /> My Profile
                                </button>
                                <button className="flex items-center w-full px-4 py-2 rounded-lg text-gray-700">
                                    <Headphones className="w-5 h-5 mr-3" /> Support
                                </button>
                                <button className="flex items-center w-full px-4 py-2 rounded-lg text-gray-700">
                                    <LogOut className="w-5 h-5 mr-3" /> Logout
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="min-h-[600px] min-w-[700px] bg-white rounded-xl p-4">
                        <div className="text-2xl mt-2 p-2 text-green-800">
                            Personal Information
                        </div>
                        <div className="flex">
                            <div className="mt-5 ml-3">
                                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dXNlcnxlbnwwfHwwfHx8MA%3D%3D" alt="" className="w-[120px] h-[120px] rounded-full" />
                            </div>
                            <div className="ml-2 mt-10 text-2xl p-2 text-green-800">
                                John Doe
                                <div className="text-sm font-light text-green-800">
                                    Manager
                                </div>
                            </div>
                        </div>
                        <div className="mt-5">
                            <div className="p-2">
                                <Input name='Name' width='100%' label="Name" placeholder="Name" type="text" value="John Doe" />
                            </div>
                            <div className="p-2">
                                <Input name='Email' width='100%' label="Email" placeholder="Email" type="email" value="john@gmail.com" />
                            </div>
                            <div className="p-2">
                                <Input name='Phone' width='100%' label="Phone Number" placeholder="Phone Number" type="phone" value="08086848595" />
                            </div>
                            <div className="p-2">
                                <Input name='Address' width='100%' label="Address" placeholder="Address" type="text" value='123 Street USA, Chicago' />
                            </div>
                            <div className="flex justify-between">
                                <div>
                                    <div className="p-2">
                                        <Input name='Password' width='350px' label="Password" placeholder="Password" type="password" value='Password' />
                                    </div>
                                </div>
                                <div>
                                    <div className="p-2">
                                        <Input name='New Password' width='350px' label="New Password" placeholder="New Password" type="password" value='Password' />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Settings