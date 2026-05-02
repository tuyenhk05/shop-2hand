export const checkLogin = (data) => {
    return {
        type: "LOGIN",
        userId: data.id,
        fullName: data.fullName,
        email: data.email,
        token: data.token,
        role: data.role
    }
}

export const logout = () => {
    return {
        type: "LOGOUT"
    }
}

export const restoreAuth = (data) => {
    return {
        type: "RESTORE_AUTH",
        ...data
    }
}
