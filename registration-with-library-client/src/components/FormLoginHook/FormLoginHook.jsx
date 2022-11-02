import React, { useState } from "react";
import { useForm } from "react-hook-form";
import LocalStorageUtils from "../../utils/LocalStorageUtils";
import { Navigate } from "react-router-dom";
import axios from "axios";

export default function FormLoginHook() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const onSubmit = (data) => {
    axios({
      url: `https://api-online-learning.herokuapp.com/api/user/login`,
      method: "POST",
      data,
    })
      .then((res) => {
        console.log(res.data);
        LocalStorageUtils.setUser(res.data.content);
        LocalStorageUtils.setToken(res.data.content.accessToken);
        <Navigate to="/Home" />;
      })
      .catch((err) => console.log(err));
  };

  if (LocalStorageUtils.getUser() !== null) {
    return <Navigate to="/" />;
  }

  return (
    <form
      style={{ width: "80%", margin: "0 auto" }}
      onSubmit={handleSubmit(onSubmit)}
      className="justify-content-center align-items-center"
    >
      <input
        {...register("username", { required: true })}
        name="username"
        placeholder="Enter your username"
      />
      {errors.username && <span>This field is required</span>}

      <input
        {...register("password", { required: true })}
        placeholder="Enter you password"
      />
      {errors.password && <span>This field is required</span>}

      <input type="submit" value="Đăng nhập" />
    </form>
  );
}
