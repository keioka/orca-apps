from datetime import datetime

async def get_lesson_and_material_by_id(prisma, lesson_id: str):
    try:
        print("lesson_id", lesson_id)
        # Fetch lesson and material by lesson ID
        lesson_material = await prisma.lesson.find_unique(
            where={"id": lesson_id},
            include={"material": True}
        )
        return lesson_material

    except Exception as e:
        print(e)
        raise e
      
async def add_message(prisma, lesson_id, full_content, type="user", created_by_id=None):
    try:
        # Check if the lesson exists
        lesson = await prisma.lesson.find_unique(where={"id": lesson_id})
        if not lesson:
            raise ValueError("Lesson with the given ID does not exist.")
      
        sentences = full_content.split(".")
               
        data = {
            "fullContent": full_content,
            "lesson": {"connect": {"id": lesson_id}},
            "type": type,
        }
        
        if (type == "user"):
          data["sentences"] = {
            "create": [
              {
                "content": sentence, 
                "sentenceIndex": index
              } 
              for index, sentence in enumerate(sentences)
            ]
          }
      
        if created_by_id:
          data['createdBy'] = {
            "connect": {
              "id": created_by_id
            }
          }
        
        # Create the message
        message = await prisma.message.create(
          data=data
        )

        return message.id

    except Exception as e:
        raise e
      
      
async def get_messages_by_lesson_id(prisma, lesson_id):
    try:
        print("============== get_messages_by_lesson_id =================")
        print("lesson_id", lesson_id)
        # Check if the lesson exists        
        
        # lesson = await prisma.lesson.find_unique(where={"id": lesson_id})
        # if not lesson:
        #     raise ValueError("Lesson with the given ID does not exist.")

        # Get messages by lesson ID
        messages = await prisma.message.find_many(where={"lessonId": lesson_id})
        return messages

    except Exception as e:
        raise e
      
