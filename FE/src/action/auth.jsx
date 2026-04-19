export const checkLogin = (data) => {
    return {
        type: "LOGIN",
        userId: data.id,
        token: data.token,
        role: data.role
    }
}

export const logout = () => {
    return {
        type: "LOGOUT"
    }
}