
export const  sendNotificationApi = async(fromId:any, toId:any, sourceId:any, msg:any, type:any ) =>{

    const payload = {
      fromId:fromId,
      userId:toId,
      sourceId:sourceId,
      message:msg,
      type:type,
      seenStatus:'0',
      status:1,

    }

    try {
      const response = await fetch('https://server.bluedibs.com/notification-alerts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      console.log('Notification sent:', data);
    } catch (error) {
      console.error('Error sending notification:', error);
    }

  }


  // api/vipChatRequest.js

export async function fetchVipChatRequestById(id:any) {
  try {
    const response = await fetch(`https://server.bluedibs.com/vip-chat-request/${id}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch VIP chat request:', error);
    throw error;
  }
}
