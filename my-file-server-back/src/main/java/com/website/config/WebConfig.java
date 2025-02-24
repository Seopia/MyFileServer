package com.website.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {
    @Value("${file.upload-dir}")
    private String uploadDir;
    @Value("${file.upload-public-file-image-url}")
    private String publicFileImageUploadDir;
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry){
//        String resourceLocation = "file:/C:/uploads/my-file-server/files/";
        registry.addResourceHandler("/download/**")  //어떤 경로로 요청이 들어오는 것을
                .addResourceLocations("file:"+uploadDir+"/")     //여기서 찾겠다
                .addResourceLocations("file:"+publicFileImageUploadDir+"/")
                .setCachePeriod(0)
                .resourceChain(true);
    }
}

