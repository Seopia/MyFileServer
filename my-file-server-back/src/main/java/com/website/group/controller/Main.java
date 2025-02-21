package com.website.group.controller;
//주어진 수 N개 중에서 소수가 몇 개인지 찾아서 출력하는 프로그램을 작성하시오.

import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        byte loop = sc.nextByte();
        int count = 0;
        for (byte i = 0; i < loop; i++) {
            int num = sc.nextInt();
            int c = 0;
            for (int j = 1; j <= num; j++) {
                if(num % j == 0){
                    c++;
                }
            }
            if(c == 2){
                count++;
            }
        }
        System.out.println(count);
    }
}
