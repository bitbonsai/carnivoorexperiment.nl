
  import { loadPage } from '/@nue/view-transitions.js'


  async function submit(event) {
    try {
      const formData = new FormData(this.$el);
      const response = await fetch('/functions/contact', {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        loadPage('thanks.html');
      }
    } catch (err) {
      console.error('Failed to submit:', err);
    }
  }  
export const lib = [
{
  name: 'contact-me',
  tagName: 'form',
  tmpl: '<form autocomplete="on" @submit="0"> <label> <span>Your name</span> <input type="text" name="name" placeholder="Example: John Doe" required> </label> <label> <span>Your email</span> <input type="email" name="email" placeholder="your@email.com" required> </label> <label> <span>Message</span> <textarea name="message" placeholder="Type here..."></textarea> </label> <button type="submit">Lets talk!</button></form>',
  fns: [
    (_,e) => { {e.preventDefault();_.submit.call(_, e)} }
  ]
}]
export default lib[0]