import { EVT } from '../EVT'
import { DOM } from '../DOM'
import { lang } from '../Lang'
import { log } from '../Log'
import { theme } from '../Theme'
import { settings } from './Settings'

// 保存和加载命名规则列表
class SaveNamingRule {
  constructor(ruleInput: HTMLInputElement) {
    this.ruleInput = ruleInput

    DOM.clearSlot('saveNamingRule')
    const wrap = DOM.useSlot('saveNamingRule', this.html)
    theme.register(wrap)

    this.saveBtn = wrap.querySelector('button.nameSave')! as HTMLButtonElement
    this.loadBtn = wrap.querySelector('button.nameLoad')! as HTMLButtonElement
    this.listWrap = wrap.querySelector('ul.namingRuleList')! as HTMLUListElement

    this.createList()

    this.bindEvents()
  }

  private readonly limit = 20 // 最大保存数量
  private saveBtn: HTMLButtonElement
  private loadBtn: HTMLButtonElement
  private listWrap: HTMLElement
  private ruleInput: HTMLInputElement
  private _show = false // 是否显示列表

  private set show(boolean: boolean) {
    this._show = boolean
    boolean ? this.showListWrap() : this.hideListWrap()
  }

  private get show() {
    return this._show
  }

  private bindEvents() {
    this.saveBtn.addEventListener('click', () => {
      this.add(this.ruleInput.value)
    })

    this.loadBtn.addEventListener('click', () => {
      this.show = !this.show
    })

    this.listWrap.addEventListener('mouseleave', () => {
      this.show = false
    })

    // 当设置发生了变化，就重新创建列表
    // 这里不要判断事件的 data.name，因为恢复设置时没有传递 data.name ，但此时依旧需要重新创建列表
    window.addEventListener(EVT.list.settingChange, () => {
      this.createList()
    })
  }

  private add(rule: string) {
    if (settings.namingRuleList.length === this.limit) {
      settings.namingRuleList.splice(0, 1)
    }
    // 如果这个规则已存在，不会重复添加它
    if (!settings.namingRuleList.includes(rule)) {
      settings.namingRuleList.push(rule)
      this.handleChange()
    }
    log.success(lang.transl('_已保存命名规则'))
  }

  private delete(index: number) {
    settings.namingRuleList.splice(index, 1)
    this.handleChange()
  }

  private select(rule: string) {
    this.ruleInput.value = rule
    settings.userSetName = rule
    EVT.fire(EVT.list.settingChange, { name: 'userSetName', value: rule })
  }

  private handleChange() {
    EVT.fire(EVT.list.settingChange, {
      name: 'namingRuleList',
      value: settings.namingRuleList,
    })
  }

  private createList() {
    const htmlArr = []
    for (let i = 0; i < settings.namingRuleList.length; i++) {
      const html = `<li>
      <span class="rule">${settings.namingRuleList[i]}</span>
      <button class="delete textButton" type="button" data-index="${i}">×</button>
    </li>`
      htmlArr.push(html)
    }
    if (settings.namingRuleList.length === 0) {
      htmlArr.push(`<li><i>&nbsp;&nbsp;&nbsp;&nbsp;no data</i></li>`)
    }
    this.listWrap.innerHTML = htmlArr.join('')

    const ruleEls = this.listWrap.querySelectorAll('.rule')
    for (const el of ruleEls) {
      el.addEventListener('click', () => {
        this.select(el.textContent!)
        this.show = false
      })
    }

    const deleteEls = this.listWrap.querySelectorAll('.delete') as NodeListOf<
      HTMLButtonElement
    >
    for (const el of deleteEls) {
      el.addEventListener('click', () => {
        const index = parseInt(el.dataset.index!)
        this.delete(index)
      })
    }
  }

  private showListWrap() {
    this.listWrap.style.display = 'block'
  }

  private hideListWrap() {
    this.listWrap.style.display = 'none'
  }

  private readonly html = `
  <div class="saveNamingRuleWrap">
  <button class="nameSave textButton has_tip" type="button" data-tip="${lang.transl(
    '_保存命名规则提示',
    this.limit.toString(),
  )}">${lang.transl('_保存')}</button>
  <button class="nameLoad textButton" type="button">${lang.transl(
    '_加载',
  )}</button>
  <ul class="namingRuleList"></ul>
  </div>`
}

export { SaveNamingRule }
