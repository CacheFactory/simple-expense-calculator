//objectComment.commentCollection.localStorage= new Backbone.LocalStorage("commentsLocalStorage")

var Transaction = Backbone.Model.extend({
	name:'transaction',
	localStorage: new Backbone.LocalStorage("transactions")
})

var TransactionCollection = Backbone.Collection.extend({
	localStorage: new Backbone.LocalStorage("transactions"),
	model:Transaction
})

var TransactionRow= Backbone.View.extend({
	initialize:function(){

		this.render()
	},
	tagName: 'tr',
	events:{
		'click .destory':'destory'
	},
	render:function(){
		var color= (this.model.get('type')=='expense')?'red':'black'
		var html = _.template('<td><%= type %></td><td><%= description %></td><td><%= category %></td><td style="color:'+color+'"><%= amount %></td><td><button class="btn btn-danger btn-mini destory">delete</button></td>',this.model.attributes)
		$(this.el).html(html)
	},
	destory:function(){
		this.options.collection.remove(this.model)
		this.model.destroy()
		this.options.listView.render()
	}
})

var TransactionView= Backbone.View.extend({
	initialize:function(){

		this.render()
	},
	events:{

	},
	render:function(){
		var html = _.template($('#modalForm').html(),this.model.attributes)
		$(this.el).html(html)
	},
	submit:function(){
		var values=$(this.el).find('form').serializeObject()
		values.amount=parseFloat(values.amount,10)
		if(values.amount>0){
			this.model.set(values).save()
			return true
		}else{
			return false
		}
		
	}
})

var ListView=Backbone.View.extend({
	initialize:function(){

		this.render()
	},
	events:{
		'click .addButton':'addTransaction'
	},
	render:function(){
		var self =this
		var html = $(_.template($('#listView').html(),{}))
		this.options.transactionCollection.each(function(model){
			var element= $('<tr></tr>')
			var row = new  TransactionRow({
				el:element,
				model:model,
				listView:self,
				collection:self.options.transactionCollection
			})
			html.find('tbody').append(element)
		})
		html.find('.totals').text('$'+this.findTotal())
		$(this.el).html(html)
		
	},
	addTransaction:function(){
		var self = this
		var footer=$('<div><a href="#" class="btn add btn-primary">Save</a><a href="#" class="btn" data-dismiss="modal">Close</a></div>');
		var html=$('<div></div>')
		var modal=showModalView(html,'Add Transaction',footer)
		var model = new Transaction()
		
		var transactionView=new TransactionView({
			el:html,
			model:model
		})
		
		var submitFunction=function(){
			if(transactionView.submit()){
				modal.modal('hide')
				self.options.transactionCollection.add(model)
				self.render()
			}else{
				alert('The ammount is invalid')
			}
		}

		footer.find('.add').bind('click',function(event){
			submitFunction()	
		})
	
	},
	findTotal:function(){
		var value = this.options.transactionCollection.reduce(function(num,trans){
			var value
			if(trans.get('type')=='expense'){
				value=num-trans.get('amount')
			}else{
				value=trans.get('amount')+num
			}

			return value
			
		},0)
		return value
	}
});


var showModalView= function(body,header,footer,optionsList){

	var options = optionsList||{}

	header=header?header:'';
	footer=footer?footer:'<a href="#" class="btn" data-dismiss="modal">Close</a>';
	var modal = $(_.template( $("#modal_template").html(), {header:header }  ));
	modal.find('.footer').html(footer);
	modal.find('.modalBody').html(body);
	

	$(modal).modal({backdrop:true,
					hide:function(){
						$(this).remove();
					}});

	return modal;
}


$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};
