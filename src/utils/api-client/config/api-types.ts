/* eslint-disable */
export interface apifoxTypes {
/**
         * @标题 获取用户卡片信息
         * @描述  
        */
        '/web/user/center/card/info,get':{
          request:{},
          response:{
            
            
            'code':number
        'data':{
            
          
            /** 
            * @描述 用户手机号、或者邮箱、或者Uid（兼容旧版本）
            */
          'userId':string
          
            /** 
            * @描述 固定为attendee（兼容旧版本）
            */
          'userType':string
        'properties':{
            
          
            /** 
            * @描述 用户哈希
            */
          'hash':string
          
            /** 
            * @描述 用户uid （请求推荐系统那边使用）
            */
          'uid':string
            /** 
            * @描述 用户数字id
            */
            'intId':number
          
            /** 
            * @描述 头像
            */
          'avatar':string
          
            /** 
            * @描述 邮箱 （这里显示的是用户卡片的邮箱和登录用的邮箱不一样）
            */
          'email':string
          
            /** 
            * @描述 手机号 （这里显示的是用户卡片的手机号和登录用的手机号不一样）
            */
          'phone':string
          
            /** 
            * @描述 个人简介
            */
          'biography':string
          
            /** 
            * @描述 所属公司
            */
          'company':string
          
            /** 
            * @描述 所属部门
            */
          'department':string
          
            /** 
            * @描述 职位
            */
          'jobTitle':string
          
            /** 
            * @描述 姓
            */
          'firstName':string
          
            /** 
            * @描述 名字
            */
          'lastName':string
          
            /** 
            * @描述 昵称
            */
          'nickname':string
          
            /** 
            * @描述 国家
            */
          'country':string
          
            /** 
            * @描述 感兴趣的
            */
          'looking_for':string
          
            /** 
            * @描述 微信号
            */
          'weChatNumber':string
          
            /** 
            * @描述 领英号
            */
          'linkInNumber':string
          
          'linkedin_home':string
        }
        'labels':{
            
        }
        'similarUsers':{
            
        }
            /** 
            * @描述 固定为false，兼容旧版本
            */
            'autoReply':boolean
      /** 
      * @描述 兼容旧版本
      */
      'viewed':Array<string>,
      /** 
      * @描述 兼容旧版本
      */
      'bookmarkedNodes':Array<string>,
      /** 
      * @描述 兼容旧版本
      */
      'bookmarkedUsers':Array<string>,
      /** 
      * @描述 兼容旧版本
      */
      'bookmarkedBy':Array<string>,
      /** 
      * @描述 兼容旧版本
      */
      'userPermissions':Array<string>,
        }
          
          'message':string
            
            'next':number
        }
        }
      }
export interface apifoxComponents {
    'CodeBaseInfo':{
            
          
          'name':string
          
          'kind':string
          
          'desc':string
            
            'stock':number
        },
    
    'NotifyInfo':{
            
          
            /** 
            * @描述 公告hash
            */
          'notify_hash':string
          
            /** 
            * @描述 活动hash
            */
          'event_hash':string
          
            /** 
            * @描述 公告标题
            */
          'title':string
          
            /** 
            * @描述 公告的内容
            */
          'content':string
            /** 
            * @描述 创建时间
            */
            'created_at':number
            /** 
            * @描述 更新时间
            */
            'updated_at':number
            /** 
            * @描述 0:默认 1:带跳转按钮
            */
            'mode':number
          
            /** 
            * @描述 mode 相关数据
            */
          'mode_data':string
        },
    
    'PorschePrize':{
            
          
            /** 
            * @描述 道具类型 (通常为luck)
            */
          'entity':string
          
            /** 
            * @描述 奖品ID (对应luck表中的ID)
            */
          'entity_id':string
            /** 
            * @描述 道具类别ID
            */
            'type_id':number
            /** 
            * @描述 奖励个数
            */
            'prize_num':number
        'assets':{
            
        'en-US':{
            
          
            /** 
            * @描述 道具简介
            */
          'name':string
          
          'desc':string
        }
        'zh-CN':{
            
          
            /** 
            * @描述 道具名称
            */
          'name':string
          
            /** 
            * @描述 道具简介
            */
          'desc':string
        }
        }
          
            /** 
            * @描述 物品图标路径
            */
          'resource_path':string
          
            /** 
            * @描述 图标名称
            */
          'resource_name':string
            /** 
            * @描述 物品稀有度 1-5个等级
            */
            'rare':number
            /** 
            * @描述 是否锁定 true:锁定 false:未锁定
            */
            'locked':boolean
          
            /** 
            * @描述 道具ID (对应goods表中的ID)
            */
          'goods_id':string
        },
    
    'UserOption':{
            
          
            /** 
            * @描述 标题，题目类型kind = accessory 时，此字段为文件原始名base64编码串
            */
          'title':string
          
            /** 
            * @描述 用户填写答案实际内容
            */
          'content':string
        },
    
    'WorkshopDetail':{
            
          
            /** 
            * @描述 workshop主持人类别 user-团队成员, event_guest-嘉宾类型(默认给个user)
            */
          'host_kind':string
          
            /** 
            * @描述 主持人哈希
            */
          'host':string
        'ticket_asset':{
            
        'zh-CN':{
            
          
            /** 
            * @描述 票种名称
            */
          'name':string
        }
        }
            /** 
            * @描述 门票(0-免费, 1-收费)
            */
            'ticket_type':number
            /** 
            * @描述 价格 分
            */
            'ticket_price':number
          
            /** 
            * @描述 币种(人民币-CNY, 美元-USD)
            */
          'ticket_currency':string
            /** 
            * @描述 数量
            */
            'ticket_amount':number
          
            /** 
            * @描述 票种哈希
            */
          'ticket_hash':string
        },
    
    '全局success返回':{
            
            
            'code':number
        'data':{
            
        }
          
          'message':string
            
            'next':number
        },
    
    '用户信息（标准）':{
            
            
            'user_id':number
          
          'user_hash':string
          
          'user_uid':string
          
          'email':string
          
          'phone':string
          
          'avatar':string
          
          'registered':string
        'asset':{
            
        'zh-CN':{
            
          
          'i18n':string
          
          'first_name':string
          
          'last_name':string
          
          'biography':string
          
          'company':string
          
          'department':string
          
          'job_title':string
          
          'country':string
          
          'linkedin_home':string
          
          'full_name':string
        }
        }
      'idents':Array<{
            
            
            'role':number
          
          'kind':string
          
            /** 
            * @描述 speaker、organizer、host 
            */
          'title':string
            
            'theme':number
        }>,
      'greetings':Array<{
            
          
            /** 
            * @描述 im账户id，目前和平台用户id一样
            */
          'accid':string
            /** 
            * @描述 0：未打招呼 1：互打
            */
            'is_greeting':number
        }>,
        },
    
    '用户信息（精简）':{
            
            /** 
            * @描述 userID
            */
            'user_id':number
          
            /** 
            * @描述 用户ID-Hash
            */
          'user_hash':string
          
            /** 
            * @描述 头像地址
            */
          'avatar':string
          
            /** 
            * @描述 名字
            */
          'first_name':string
          
            /** 
            * @描述 姓
            */
          'last_name':string
          
            /** 
            * @描述 职位
            */
          'job_title':string
          
            /** 
            * @描述 所属公司
            */
          'company':string
          
            /** 
            * @描述 身份类型 speaker、organizer、host、org、org_tem
            */
          'role_kind':string
        },
    }