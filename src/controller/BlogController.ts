import { BlogService } from '~/services/blog.services'
import { Request, Response } from 'express'
import { ResponseHandle } from '~/utils/Response'
import { Blog } from '~/models/schemas/blog.schema'

class BlogController {
  public blogService: BlogService
  constructor() {
    this.blogService = new BlogService()
    this.getBlogs = this.getBlogs.bind(this)
    this.getBlogById = this.getBlogById.bind(this)
    this.createBlog = this.createBlog.bind(this)
    this.updateBlog = this.updateBlog.bind(this)
    this.deleteBlog = this.deleteBlog.bind(this)
  }

  public async getBlogs(req: Request, res: Response): Promise<void> {
    console.log('getAllBlogs Controller')

    try {
      const result = await this.blogService.getBlogs()
      console.log('Controller result: ', result)
      if (result.success) {
        ResponseHandle.responseSuccess(res, result.data, 'Blogs fetched successfully', 200)
      } else {
        ResponseHandle.responseError(res, null, result.message, 400)
      }
    } catch (error: any) {
      ResponseHandle.responseError(res, error, 'Failed to get blogs', 500)
    }
  }

  public async getBlogById(req: Request, res: Response): Promise<void> {
    try {
      const { blogId } = req.params
      if (!blogId) {
        ResponseHandle.responseError(res, null, 'Blog ID is required', 400)
        return
      }

      const result = await this.blogService.getBlogById(blogId)
      console.log('Controller result: ', result)
      if (result.success) {
        ResponseHandle.responseSuccess(res, result.data, 'Blog fetched successfully', 200)
      } else {
        ResponseHandle.responseError(res, null, result.message, 404)
      }
    } catch (error: any) {
      console.error('Error in getBlogById Controller:', error)
      ResponseHandle.responseError(res, error, 'Failed to fetch blog', 500)
    }
  }

  public async createBlog(req: Request, res: Response): Promise<void> {
    console.log('createBlog Controller')
    try {
      const { title, content, imageUrl } = req.body
      const adminId = req.user?.user_id

      if (!title || !content || !adminId) {
        ResponseHandle.responseError(res, null, 'Title, content, and admin ID are required', 400)
        return
      }

      const result = await this.blogService.createBlog(title, content, adminId, imageUrl)
      console.log('Controller result: ', result)

      if (result.success) {
        ResponseHandle.responseSuccess(res, null, result.message, 201)
      } else {
        ResponseHandle.responseError(res, null, result.message, 400)
      }
    } catch (error: any) {
      console.error('Error in createBlog controller:', error)
      ResponseHandle.responseError(res, error, 'Failed to create blog', 500)
    }
  }

  public async updateBlog(req: Request, res: Response): Promise<void> {
    console.log('updateBlog Controller')
    try {
      const { blogId } = req.params
      const { title, content, imageUrl } = req.body

      if (!blogId) {
        ResponseHandle.responseError(res, null, 'Blog ID is required', 400)
        return
      }

      const blogData: Partial<Blog> = {
        blogId,
        title,
        content,
        image_url: imageUrl
      }

      const result = await this.blogService.updateBlog(blogData)
      console.log('Controller result: ', result)

      if (result.success) {
        ResponseHandle.responseSuccess(res, null, result.message, 200)
      } else {
        ResponseHandle.responseError(res, null, result.message, 400)
      }
    } catch (error: any) {
      console.error('Error updating blog:', error)
      ResponseHandle.responseError(res, error, 'Failed to update blog', 500)
    }
  }

  public async deleteBlog(req: Request, res: Response): Promise<void> {
    console.log('deleteBlog Controller')
    try {
      const { blogId } = req.params
      console.log('deleteBlog Controller blogId:', blogId)

      if (!blogId) {
        ResponseHandle.responseError(res, null, 'Blog ID is required', 400)
        return
      }

      const result = await this.blogService.deleteBlogById(blogId)
      console.log('Controller result: ', result)

      if (result.success) {
        ResponseHandle.responseSuccess(res, null, result.message, 200)
      } else {
        ResponseHandle.responseError(res, null, result.message, 404)
      }
    } catch (error: any) {
      console.error('Error in deleteBlog controller:', error)
      ResponseHandle.responseError(res, error, 'Failed to delete blog', 500)
    }
  }
}

export default BlogController
