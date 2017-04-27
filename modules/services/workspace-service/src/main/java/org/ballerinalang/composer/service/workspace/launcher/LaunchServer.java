/*
 * Copyright (c) 2017, WSO2 Inc. (http://wso2.com) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.ballerinalang.composer.service.workspace.launcher;

import com.google.gson.Gson;
import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.Channel;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelPipeline;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.codec.http.HttpObjectAggregator;
import io.netty.handler.codec.http.HttpServerCodec;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;
import org.ballerinalang.composer.service.workspace.launcher.dto.MessageDTO;


/**
 * Launch Server , websocket server which handles launch requests and stream
 * application output back to the client
 */
public class LaunchServer {

    private int port;

    LaunchServer(int port) {
        this.port = port;
    }

    /**
     *  Debug server initializer class
     */
    static class LaunchServerInitializer extends ChannelInitializer<SocketChannel> {

        @Override
        public void initChannel(SocketChannel ch) throws Exception {
            ChannelPipeline pipeline = ch.pipeline();
            pipeline.addLast(new HttpServerCodec());
            pipeline.addLast(new HttpObjectAggregator(65536));
            pipeline.addLast(new LaunchServerHandler());
        }
    }

    public void startServer() {
        //lets start the server in a new thread.
        Runnable run = new Runnable() {
            public void run() {
                LaunchServer.this.startListning();
            }
        };
        (new Thread(run)).start();
    }

    private void startListning() {
        EventLoopGroup bossGroup = new NioEventLoopGroup(1);
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        try {
            ServerBootstrap b = new ServerBootstrap();
            b.group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    //todo enable log in debug mode
                    //.handler(new LoggingHandler(LogLevel.INFO))
                    .childHandler(new LaunchServerInitializer());
            Channel ch = b.bind(port).sync().channel();

            ch.closeFuture().sync();
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        } catch (InterruptedException e) {
            //@todo proper error handling
        } finally {
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
    }

    /**
     * Push message to client.
     *
     * @param launchSession the launch session
     * @param status       the status
     */
    public void pushMessageToClient(LaunchSession launchSession, MessageDTO status) {
        Gson gson = new Gson();
        String json = gson.toJson(status);
        launchSession.getChannel().write(new TextWebSocketFrame(json));
        launchSession.getChannel().flush();
    }

}
