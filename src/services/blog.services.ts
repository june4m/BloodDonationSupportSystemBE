import { Blog } from '~/models/schemas/blog.schema'
import { BlogRepository } from '~/repository/blog.repository'

export class BlogService {
  public blogRepository: BlogRepository

  constructor() {
    this.blogRepository = new BlogRepository()
  }

  public async getBlogs(): Promise<any> {
    console.log('getBlogs Services')
    try {
      const blogs = await this.blogRepository.getBlogs()
      console.log('blogs: ', blogs)
      return { success: true, data: blogs }
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to get blogs' }
    }
  }

  public async getBlogById(blogId: string): Promise<any> {
    console.log('getBlogByID Services')
    try {
      const blog = await this.blogRepository.getBlogById(blogId)
      console.log('blog: ', blog)
      if (!blog) {
        return { success: false, message: 'Blog not found' }
      }
      return { success: true, data: blog }
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to get blog by ID' }
    }
  }

  public async createBlog(title: string, content: string, adminId: string, imageUrl?: string): Promise<any> {
    if (!title || !content || !adminId) {
      return { success: false, message: 'Missing required fields' }
    }

    const publishedAt = new Date()

    const blogData: Blog = {
      title,
      content,
      publishedAt,
      adminId,
      image_url: imageUrl
    }

    const result = await this.blogRepository.createBlog(blogData)
    return result
  }

  public async updateBlog(blogData: Partial<Blog>): Promise<any> {
    if (!blogData.blogId) {
      return { success: false, message: 'Blog ID is required' }
    }
    const result = await this.blogRepository.updateBlog(blogData)
    console.log('Service result: ', result)
    return result
  }

  public async deleteBlogById(blogId: string): Promise<any> {
    if (!blogId) {
      return { success: false, message: 'Blog ID is required' }
    }

    const result = await this.blogRepository.deleteBlogById(blogId)
    console.log('Service result: ', result)
    return result
  }
}
