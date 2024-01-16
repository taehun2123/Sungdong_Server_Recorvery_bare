import express, { Router, Request, Response } from "express"
import jwt from 'jsonwebtoken'
import { v1, v4 } from 'uuid'
const User = require("../models/users.model.js");

const jwtSecret = 'sung_dong'

const authController = {
    login : async (req : Request, res : Response) => {
        const loadUser = req.body                
        User.login(loadUser, (err: { kind: string; }, data: any) => {
            if (err) {
                if (err.kind === "not_found") {
                    res.json({ success: false, message: "아이디나 패스워드를 다시 확인해주세요!"});
                } else {
                    console.error(err);
                    res.status(500).json({ success: false, message: "서버 오류 발생" });
                }
        }
        else {
            if (data) {
                req.user = data;
                res.json({ success: true, message: "로그인 되었습니다."});
                }
                else {
                res.json({ success: false, message: "아이디 및 비밀번호를 확인해주세요!"})
                }
            }
        })

        const token = jwt.sign({
            userType_id : loadUser.userType_id,
            userId : loadUser.userId
        }, jwtSecret, 
        { expiresIn : '1h' })
        
        return res.json({token})
    },
    register : async (req : Request, res : Response) => {
        const uid = v4()
        if(!req.body){
            res.status(400).send({
                message: "내용을 채워주세요!"
            });
        };

        const user = new User({
            userType_id: req.body.userType_id,
            userId: req.body.userId,
            userPassword: req.body.userPassword,
        });
        const user_type = new User({
            userType_id: req.body.userType_id,
            userType_name: req.body.userType_name,
        })
        // 데이터베이스에 저장
        User.create(user, (err: { message: any; }, data: any) =>{
            if(err){
                res.status(500).send({
                    message:
                    err.message || "유저 정보를 갱신하는 중 서버 오류가 발생했습니다."
                });
            } else {
            res.send({message: '성공적으로 회원가입이 완료되었습니다.', success: true});
            }
        })
        User.typeCreate(user_type, (err: { message: any; }, data: any) =>{
            if(err){
                res.status(500).send({
                    message:
                    err.message || "유저 정보를 갱신하는 중 서버 오류가 발생했습니다."
                });
            } else {
            res.send({message: '성공적으로 작성이 완료되었습니다.', success: true});
            }
        })
        return res.status(200).json({ msg: "Register!" });
    },
    user : async (req : Request, res : Response) => {        
        const token = req.header('Authorization');
        if (!token) {
            return res.status(401).json({msg : "token null"})
        }

        jwt.verify(token, jwtSecret, (err, user) => {
            if (err) {
                return res.status(403).json({msg : "Invalid Token"})
            }
            return res.status(200).json({user : user})
        })
    }
}

export default authController