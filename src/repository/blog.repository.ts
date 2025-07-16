import { Blog } from '~/models/schemas/blog.schema'
import databaseServices from '~/services/database.services'

export class BlogRepository {
  public async getBlogs(): Promise<any> {
    console.log('getBlog Repo')
    const query = `
        SELECT * FROM Blog
    `
    try {
      const result = await databaseServices.query(query)
      console.log('Repo result: ', result)
      return result
    } catch (error) {
      console.error('Error fetching blogs:', error)
      throw new Error('Failed to get blogs')
    }
  }

  public async getBlogById(blogId: string): Promise<any> {
    console.log('getBlogById Repo')
    const query = `SELECT * FROM Blog WHERE Blog_ID = ?`
    try {
      const result = await databaseServices.queryParam(query, [blogId])
      console.log('Repo result: ', result.recordset)
      return result.recordset[0] ?? null
    } catch (error) {
      console.error('Error in getBlogById Repo:', error)
      throw new Error('Failed to fetch blog by ID')
    }
  }

  public async createBlog(blogData: Blog): Promise<any> {
    let newBlogId = 'BL001'
    const lastId = `
              SELECT TOP 1 Blog_ID
              FROM Blog
              ORDER BY CAST(SUBSTRING(Blog_ID, 3, LEN(Blog_ID) - 1) AS INT) DESC
              `

    const lastIdResult = await databaseServices.query(lastId)
    console.log('lastIdResult: ', lastIdResult[0])
    if (lastIdResult.length > 0) {
      const lastBlogId = lastIdResult[0].Blog_ID // ex: 'S005'
      console.log('lastPatientId: ', lastBlogId)
      const numericPart = parseInt(lastBlogId.slice(2)) // => 5
      console.log('numericPart: ', numericPart)
      const nextId = numericPart + 1
      console.log('nextId: ', nextId)
      newBlogId = 'BL' + String(nextId).padStart(3, '0') // => 'S006'
      console.log('newBlogId: ', newBlogId)
    }

    const query = `
    INSERT INTO Blog (Blog_ID, Title, Content, Pubished_At, Admin_ID, Image_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `
    const params = [
      newBlogId,
      blogData.title,
      blogData.content,
      blogData.publishedAt,
      blogData.adminId,
      blogData.image_url
    ]

    try {
      const result = await databaseServices.queryParam(query, params)
      return result.rowsAffected[0] > 0
        ? { success: true, message: 'Blog created successfully' }
        : { success: false, message: 'Failed to create blog' }
    } catch (error) {
      console.error('Error in createBlog Repo:', error)
      throw new Error('Database error while creating blog')
    }
  }

  public async updateBlog(blogData: Partial<Blog>): Promise<any> {
    console.log('updateBlog Repo')

    if (!blogData.blogId) {
      return { success: false, message: 'Blog ID is required' }
    }

    let query = `UPDATE Blog SET `
    const updates: string[] = []
    const params: any[] = []

    if (blogData.title) {
      updates.push('Title = ?')
      params.push(blogData.title)
    }

    if (blogData.content) {
      updates.push('Content = ?')
      params.push(blogData.content)
    }

    if (blogData.image_url) {
      updates.push('Image_url = ?')
      params.push(blogData.image_url)
    }

    updates.push('Update_At = ?')
    params.push(new Date())

    if (updates.length === 0) {
      return { success: false, message: 'No fields provided to update' }
    }

    query += updates.join(', ') + ' WHERE Blog_ID = ?'
    params.push(blogData.blogId)

    try {
      const result = await databaseServices.queryParam(query, params)
      console.log('Repo result: ', result)
      if (result.rowsAffected && result.rowsAffected[0] > 0) {
        return { success: true, message: 'Blog updated successfully' }
      } else {
        return { success: false, message: 'No blog updated' }
      }
    } catch (error) {
      console.error('Error updating blog:', error)
      throw new Error('Database error while updating blog')
    }
  }

  public async deleteBlogById(blogId: string): Promise<any> {
    console.log('deleteBlogById Repo')
    const query = `DELETE FROM Blog WHERE Blog_ID = ?`

    try {
      const result = await databaseServices.queryParam(query, [blogId])
      console.log('Repo result:', result)

      if (result.rowsAffected && result.rowsAffected[0] > 0) {
        return { success: true, message: 'Blog deleted successfully' }
      } else {
        return { success: false, message: 'No blog found with the provided ID' }
      }
    } catch (error) {
      console.error('Error deleting blog:', error)
      throw new Error('Database error while deleting blog')
    }
  }
}
