export const checkLogin = (data) => {
    let role = data.role;
    if (role && typeof role === 'object') {
        role = role.name || role.id || JSON.stringify(role);
    } else if (role === undefined || role === null) {
        role = 'customer';
    } else {
        role = String(role);
    }

    return {
        type: "LOGIN",
        userId: data.id,
        fullName: data.fullName,
        email: data.email,
        token: data.token,
        role: role
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
