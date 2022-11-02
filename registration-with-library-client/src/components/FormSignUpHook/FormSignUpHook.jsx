import axios from "axios";
import React from "react";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";

export default function FormSignUpHook() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const onSubmit = (data) => {
    axios({
      url: "https://api-online-learning.herokuapp.com/api/user/signup",
      method: "POST",
      data,
    })
      .then((res) => {
        console.log(res.data);
        alert(res.data.message);
        <Navigate to="/form-login" />;
      })
      .catch((err) => console.log(err));
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-50 justify-content-center align-items-center"
    >
      <input
        {...register("fullname", { required: true })}
        name="fullname"
        placeholder="Enter your fullname"
      />
      {errors.fullname && (
        <span className="text-danger">This field is required</span>
      )}

      <input
        {...register("phone")}
        name="phone"
        placeholder="Enter your phone"
      />

      <input
        {...register("username", { required: true })}
        name="username"
        placeholder="Enter your username"
      />
      {errors.username && (
        <span className="text-danger">This field is required</span>
      )}

      <input
        {...register("email")}
        name="email"
        placeholder="Enter your email address"
      />

      <input
        {...register("password", { required: true })}
        name="password"
        placeholder="Enter your password"
      />
      {errors.password && (
        <span className="text-danger">This field is required</span>
      )}

      <input
        {...register("confirmPassword", { required: true })}
        name="confirmPassword"
        placeholder="Enter your confirm password"
      />
      {errors.confirmPassword && (
        <span className="text-danger">This field is required</span>
      )}

      <input type="submit" value="Đăng ký" />
    </form>
  );
}
